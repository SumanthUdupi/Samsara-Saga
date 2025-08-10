<script lang="ts">
  import type { PageData } from './$types';

  export let data: PageData;

  // Create a local, modifiable copy of the player state
  let localPlayerState = { ...data.playerState };

  let narrativeLog: { type: 'action' | 'narrative', text: string }[] = [];
  let isLoading = false;

  // Initialize the narrative log with the starting description
  if (narrativeLog.length === 0) {
    narrativeLog = [{ type: 'narrative', text: localPlayerState.location_description }];
  }

  async function handleAction(actionType: string, actionText: string) {
    isLoading = true;
    narrativeLog = [...narrativeLog, { type: 'action', text: `> ${actionText}` }];

    try {
      const response = await fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType })
      });

      if (!response.ok) throw new Error('Action failed');

      const result = await response.json();

      if (result.narrative) {
        narrativeLog = [...narrativeLog, { type: 'narrative', text: result.narrative }];
      }

      // If the API returns a new karma score, update our local state
      if (result.newKarmaScore !== undefined) {
        localPlayerState.karma_score = result.newKarmaScore;
      }

    } catch (error) {
      console.error(error);
      narrativeLog = [...narrativeLog, { type: 'narrative', text: 'You try, but nothing happens.' }];
    } finally {
      isLoading = false;
    }
  }
</script>

<main class="container mx-auto p-4 md:p-8 font-serif">

  <div class="card w-full bg-base-200 shadow-lg mb-8">
    <div class="card-body">
      <h2 class="card-title text-2xl border-b-2 border-base-300 pb-2">
        {localPlayerState.location_name}
      </h2>
      <div class="py-4 text-lg leading-relaxed space-y-4">
        {#each narrativeLog as entry}
          {#if entry.type === 'action'}
            <p class="text-info italic">{entry.text}</p>
          {:else}
            <p class="whitespace-pre-line">{entry.text}</p>
          {/if}
        {/each}
        {#if isLoading}
          <div class="text-center py-4"><span class="loading loading-dots loading-md"></span></div>
        {/if}
      </div>
    </div>
  </div>

  <div class="card w-full bg-base-200 shadow-lg mb-8">
    <div class="card-body">
      <h3 class="card-title">Your State of Being</h3>
      <p>Karma Score: <span class="font-bold text-accent">{localPlayerState.karma_score}</span></p>
    </div>
  </div>

  <div class="card w-full bg-base-200 shadow-lg">
    <div class="card-body">
      <h3 class="card-title">What is your will?</h3>
      <div class="join mt-4">
        <button class="btn btn-primary join-item" on:click={() => handleAction('LOOK_AROUND', 'Look Around')} disabled={isLoading}>
          Look Around
        </button>
        <button class="btn btn-primary join-item" on:click={() => handleAction('MEDITATE', 'Meditate')} disabled={isLoading}>
          Meditate
        </button>
        <button class="btn btn-outline join-item" disabled={isLoading}>Check Inventory</button>
      </div>
    </div>
  </div>

</main>