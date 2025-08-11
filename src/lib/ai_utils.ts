// src/lib/ai_utils.ts

interface AIPlatform {
    env: {
        AI: {
            run: (model: string, options: any) => Promise<any>;
        };
    };
}

/**
 * Retries an AI function call up to a specified number of times with exponential backoff.
 * @param fn The AI function to call.
 * @param retries The maximum number of retries.
 * @param delay The initial delay in milliseconds.
 * @returns The result of the AI function call.
 * @throws Error if the AI function call fails after all retries.
 */
export async function retryAI<T>(
    fn: () => Promise<T>,
    retries: number = 5,
    delay: number = 1000
): Promise<T> {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            console.error(`AI call failed (attempt ${i + 1}/${retries}):`, error);
            if (i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
            } else {
                throw error; // Re-throw error if all retries fail
            }
        }
    }
    throw new Error("Max retries reached for AI call."); // Should not be reached
}

export async function getEmbeddings(platform: AIPlatform, text: string): Promise<number[]> {
    try {
        const response = await retryAI(() =>
            platform.env.AI.run('@cf/baai/bge-small-en-v1.5', { text })
        );
        if (response && response.data && response.data.length > 0) {
            return response.data[0];
        }
        throw new Error("Failed to get embeddings from AI.");
    } catch (error) {
        console.error("Error generating embeddings:", error);
        throw error;
    }
}

export function cosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) {
        throw new Error("Vectors must be of the same length.");
    }

    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    for (let i = 0; i < vec1.length; i++) {
        dotProduct += vec1[i] * vec2[i];
        magnitude1 += vec1[i] * vec1[i];
        magnitude2 += vec2[i] * vec2[i];
    }

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) {
        return 0; // Avoid division by zero
    }

    return dotProduct / (magnitude1 * magnitude2);
}

export interface KnowledgeBaseEntry {
    text: string;
    embedding: number[];
}

export async function buildKnowledgeBase(platform: AIPlatform, data: Record<string, string>): Promise<KnowledgeBaseEntry[]> {
    const knowledgeBase: KnowledgeBaseEntry[] = [];
    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            const text = data[key];
            const embedding = await getEmbeddings(platform, text);
            knowledgeBase.push({ text, embedding });
        }
    }
    return knowledgeBase;
}

export function retrieveContext(queryEmbedding: number[], knowledgeBase: KnowledgeBaseEntry[], topK: number = 1): string {
    if (knowledgeBase.length === 0) {
        return "";
    }

    const similarities = knowledgeBase.map((entry, index) => ({
        index,
        similarity: cosineSimilarity(queryEmbedding, entry.embedding)
    }));

    similarities.sort((a, b) => b.similarity - a.similarity);

    // For simplicity, returning only the top 1 context for now
    if (topK === 1 && similarities.length > 0) {
        return knowledgeBase[similarities[0].index].text;
    }

    // If topK > 1, concatenate the topK contexts
    const topKContexts = similarities.slice(0, topK).map(s => knowledgeBase[s.index].text);
    return topKContexts.join("\n\n"); // Join with double newline for better separation
}