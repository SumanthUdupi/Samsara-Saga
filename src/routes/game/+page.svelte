<script lang="ts">
  import type { PageData } from './$types';
  import { invalidateAll } from '$app/navigation';
  import { slide } from 'svelte/transition';

  export let data: PageData;

  $: ({ playerState, exits, npcs, activeQuests } = data);
  let localPlayerState = { ...playerState };
  
  // ... (all other script variables remain the same)
  let questAcceptedMessage = '';

  // ... (handleAction, openCrafting, handleCraft, openConversation functions are the same)
  
  // Update handleSendMessage to show a message when a quest is accepted
  async function handleSendMessage() {
    // ... (existing logic)
    const data = await response.json();
    conversationHistory = [...conversationHistory, { role: 'model', text: data.response }];
    isAiResponding = false;
    
    // NEW: Check if a quest was accepted in the response
    if (data.quest_offered) {
        questAcceptedMessage = `New Quest Accepted: ${data.quest_offered.title}`;
        setTimeout(() => questAcceptedMessage = '', 4000); // Hide message after 4s
        await invalidateAll(); // Reload page data to show the new quest in the log
    }
  }
</script>

<main class="container mx-auto p-4 md:p-8 font-serif">
    {#if activeQuests && activeQuests.length > 0}
        <div class="card w-full bg-base-200 shadow-lg mb-8">
            <div class="card-body">
                <h3 class="card-title">Active Dharma (Quests)</h3>
                <div class="py-2 space-y-4">
                    {#each activeQuests as quest}
                        <div>
                            <p class="font-bold text-accent">{quest.title}</p>
                            <p class="text-sm opacity-80">{quest.description_template}</p>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    {/if}

    </main>

{#if questAcceptedMessage}
    <div class="toast toast-top toast-center" transition:slide>
        <div class="alert alert-success">
            <span>{questAcceptedMessage}</span>
        </div>
    </div>
{/if}