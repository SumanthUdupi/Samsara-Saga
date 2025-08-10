<script lang="ts">
  // In future steps, we will add our game logic here.
  let scene: 'introduction' | 'questioning' = 'introduction';
  let rishiDialogue = "A new soul approaches. Before you begin your journey through samsara, we must discern the star that guides you. Are you ready to discover your nature?";
  let currentQuestion = ""; // This will hold the question from the Rishi
  let playerChoices: string[] = []; // This will hold the possible answers
</script>

<main class="container mx-auto p-4 font-serif flex flex-col items-center justify-center min-h-screen">
  <div class="card w-full max-w-2xl bg-base-200 shadow-xl">
    <div class="card-body">
      <h1 class="card-title text-2xl">The Celestial Rishi</h1>
      <p class="py-4 whitespace-pre-line">{rishiDialogue}</p>

      {#if scene === 'introduction'}
        <div class="card-actions justify-end">
          <button class="btn btn-primary" on:click={() => scene = 'questioning'}>
            I am ready.
          </button>
        </div>
      {/if}

      {#if scene === 'questioning'}
        <p class="text-info">The questioning begins...</p>
      {/if}
    </div>
  </div>
</main>