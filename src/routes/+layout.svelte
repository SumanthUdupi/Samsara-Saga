<script lang="ts">
  import { goto } from '$app/navigation'; // Import the navigation module

  // --- DATA ---
  // Add a unique 'id' to each Nakshatra for database purposes.
  const nakshatras = [
    { id: 1, name: 'Ashwini', nature: 'Short', deity: 'Ashwini Kumaras' },
    { id: 2, name: 'Bharani', nature: 'Cruel', deity: 'Yama' },
    { id: 3, name: 'Krittika', nature: 'Ordinary', deity: 'Agni' },
    { id: 4, name: 'Rohini', nature: 'Fixed', deity: 'Brahma/Prajapati' },
    { id: 5, name: 'Mrigashira', nature: 'Gentle', deity: 'Soma/Chandra' },
    { id: 6, name: 'Ardra', nature: 'Ferocious', deity: 'Rudra' },
    { id: 7, name: 'Punarvasu', nature: 'Movable', deity: 'Aditi' },
    { id: 8, name: 'Pushya', nature: 'Short', deity: 'Brihaspati' },
    { id: 9, name: 'Ashlesha', nature: 'Ferocious', deity: 'Nagas/Sarpas' },
    { id: 10, name: 'Magha', nature: 'Cruel', deity: 'Pitris (Ancestors)' },
    { id: 11, name: 'Purva Phalguni', nature: 'Cruel', deity: 'Bhaga' },
    { id: 12, name: 'Uttara Phalguni', nature: 'Fixed', deity: 'Aryaman' },
    { id: 13, name: 'Hasta', nature: 'Short', deity: 'Savitr/Surya' },
    { id: 14, name: 'Chitra', nature: 'Gentle', deity: 'Tvashtar/Vishvakarma' },
    { id: 15, name: 'Swati', nature: 'Movable', deity: 'Vayu' },
    { id: 16, name: 'Vishakha', nature: 'Ordinary', deity: 'Indra & Agni' },
    { id: 17, name: 'Anuradha', nature: 'Gentle', deity: 'Mitra' },
    { id: 18, name: 'Jyeshtha', nature: 'Ferocious', deity: 'Indra' },
    { id: 19, name: 'Mula', nature: 'Ferocious', deity: 'Nirriti' },
    { id: 20, name: 'Purva Ashadha', nature: 'Cruel', deity: 'Apah (Water)' },
    { id: 21, name: 'Uttara Ashadha', nature: 'Fixed', deity: 'Vishvadevas' },
    { id: 22, name: 'Shravana', nature: 'Movable', deity: 'Vishnu' },
    { id: 23, name: 'Dhanishtha', nature: 'Movable', deity: 'The Eight Vasus' },
    { id: 24, name: 'Shatabhisha', nature: 'Movable', deity: 'Varuna' },
    { id: 25, name: 'Purva Bhadrapada', nature: 'Cruel', deity: 'Aja Ekapada' },
    { id: 26, name: 'Uttara Bhadrapada', nature: 'Fixed', deity: 'Ahirbudhnya' },
    { id: 27, name: 'Revati', nature: 'Gentle', deity: 'Pushan' }
  ];

  const questions = [
    {
      text: "A great injustice unfolds. Does your spirit burn with a fire for retribution, or fill with a cool river of compassion?",
      choices: [ { text: "Burn with fire.", nature: 'Cruel' }, { text: "Flow with compassion.", nature: 'Gentle' } ]
    },
    {
      text: "You face an ancient, locked door. Do you seek the hidden key, trusting in a pre-ordained path, or do you forge a new way around, creating your own?",
      choices: [ { text: "Seek the key.", nature: 'Fixed' }, { text: "Forge a new way.", nature: 'Movable' } ]
    },
    {
      text: "To restore a fallen kingdom, what is your first act? A grand, inspiring ritual to rally the people, or a swift, practical action to secure the food stores?",
      choices: [ { text: "A grand ritual.", nature: 'Ordinary' }, { text: "A practical action.", nature: 'Short' } ]
    }
  ];

  // --- Component State ---
  let scene: 'introduction' | 'questioning' | 'result' = 'introduction';
  let currentQuestionIndex = 0;
  let playerAffinities: Record<string, number> = {};
  let determinedNakshatra: { id: number; name: string; nature: string; deity: string } | null = null;
  let isLoading = false; // To show a loading state on the button

  // --- LOGIC ---
  function selectAnswer(nature: string) {
    playerAffinities[nature] = (playerAffinities[nature] || 0) + 1;
    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex++;
    } else {
      runNakshatraDetermination();
      scene = 'result';
    }
  }

  function runNakshatraDetermination() {
    const dominantNature = Object.keys(playerAffinities).length > 0 ? Object.entries(playerAffinities).sort((a, b) => b[1] - a[1])[0][0] : 'Gentle';
    const possibleNakshatras = nakshatras.filter(n => n.nature === dominantNature);
    determinedNakshatra = possibleNakshatras[Math.floor(Math.random() * possibleNakshatras.length)] || nakshatras[0];
  }

  function startQuestioning() {
    currentQuestionIndex = 0;
    playerAffinities = {};
    determinedNakshatra = null;
    scene = 'questioning';
  }

  // NEW FUNCTION: This function calls our new backend endpoint.
  async function beginJourney() {
    if (!determinedNakshatra) return;
    isLoading = true;

    try {
      const response = await fetch('/api/create-character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nakshatraId: determinedNakshatra.id })
      });

      if (!response.ok) {
        throw new Error('Failed to create character');
      }

      // On success, navigate to the main game page
      await goto('/game');

    } catch (error) {
      console.error(error);
      alert('Failed to begin journey. Please try again.'); // User-friendly error message
    } finally {
      isLoading = false;
    }
  }
</script>

<main class="container mx-auto p-4 font-serif flex flex-col items-center justify-center min-h-screen">
  <div class="card w-full max-w-2xl bg-base-200 shadow-xl transition-all duration-500">
    <div class="card-body">
      <h1 class="card-title text-2xl">The Celestial Rishi</h1>
      
      {#if scene === 'introduction'}
        <p class="py-4">A new soul approaches. Before you begin your journey through samsara, we must discern the star that guides you. Are you ready to discover your nature?</p>
        <div class="card-actions justify-end">
          <button class="btn btn-primary" on:click={startQuestioning}>I am ready.</button>
        </div>
      {/if}

      {#if scene === 'questioning'}
        {@const question = questions[currentQuestionIndex]}
        <p class="py-4 text-lg italic">"{question.text}"</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          {#each question.choices as choice}
            <button class="btn btn-outline" on:click={() => selectAnswer(choice.nature)}>{choice.text}</button>
          {/each}
        </div>
      {/if}

      {#if scene === 'result' && determinedNakshatra}
        <p class="py-4">The cosmos resonates with your nature. Your path is aligned with the **{determinedNakshatra.nature}** star...</p>
        <h2 class="text-3xl font-bold text-center text-accent py-4">{determinedNakshatra.name}</h2>
        <p class="text-center">You are guided by **{determinedNakshatra.deity}**. May this boon serve you well on your journey to moksha.</p>
        <div class="card-actions justify-end pt-6">
          <button class="btn btn-primary" on:click={beginJourney} disabled={isLoading}>
            {#if isLoading}
              <span class="loading loading-spinner"></span>
            {/if}
            Begin Journey
          </button>
        </div>
      {/if}
    </div>
  </div>
</main>