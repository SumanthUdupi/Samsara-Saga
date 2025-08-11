<script lang="ts">
  import type { PageData } from './$types';
  import { invalidateAll } from '$app/navigation';
  import { slide } from 'svelte/transition';

  export let data: PageData;

  $: ({ playerState, exits, npcs, activeQuests, itemsInLocation, companions } = data);
  let localPlayerState = { ...playerState };

  // Find the active companion from the list
  $: activeCompanion = companions?.find(c => c.status === 'active');
  
  let isCompanionOpen = false;
  let companionDialog: HTMLDialogElement;
  let narrative: string | null = null; // To hold narrative feedback from actions
  let isLoading = false; // To disable buttons during an action

  async function handleAction(actionType: string, narrativeDescription: string, payload: any = {}) {
    isLoading = true;
    narrative = narrativeDescription; // Show initial feedback

    try {
      const response = await fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType, payload }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        if (result.narrative) {
          narrative = result.narrative;
        } else {
          // Clear narrative if the action was successful but had no specific story response
          narrative = null; 
        }
        await invalidateAll(); // Refresh game state
      } else {
        narrative = result.error || 'An unknown error occurred.';
      }
    } catch (error) {
      narrative = 'A network error occurred. Please try again.';
    } finally {
      isLoading = false;
    }
  }

  // NEW function to open the companion management modal
  function openCompanions() {
    isCompanionOpen = true;
  }

  async function handleSetActiveCompanion(companionId: string) {
    await handleAction('SET_ACTIVE_COMPANION', `Setting ${companionId} as active companion...`, { companionId });
    isCompanionOpen = false;
  }

  $: {
    if (companionDialog && isCompanionOpen) {
      companionDialog.showModal();
    } else if (companionDialog && !isCompanionOpen) {
      companionDialog.close();
    }
  }
</script>

<main class="container mx-auto p-4 md:p-8 font-serif">
    {#if narrative}
        <div class="alert alert-info shadow-lg mb-4" transition:slide>
            <div>
                <span>{narrative}</span>
            </div>
            <div class="flex-none">
                <button class="btn btn-sm btn-ghost" on:click={() => narrative = null}>Dismiss</button>
            </div>
        </div>
    {/if}

    <div class="card w-full bg-base-200 shadow-lg mb-8">
        <div class="card-body">
            <h3 class="card-title">Companion</h3>
            {#if activeCompanion}
                <div class="tooltip" data-tip={activeCompanion.description}>
                    <p><span class="font-bold text-accent">{activeCompanion.name}</span>, {activeCompanion.title}</p>
                </div>
                <div class="card-actions justify-end">
                    {#if activeCompanion.id === 'vanara_kavi'}
                        <button class="btn btn-sm btn-accent" on:click={() => handleAction('USE_COMPANION_ABILITY', 'Using Pathfinder...')} disabled={isLoading}>
                            Use Pathfinder
                        </button>
                    {/if}
                    <button class="btn btn-sm" on:click={openCompanions} disabled={isLoading}>Switch</button>
                </div>
            {:else}
                <p class="opacity-70 italic">You travel alone.</p>
                {#if companions && companions.length > 0}
                    <div class="card-actions justify-end">
                        <button class="btn btn-sm" on:click={openCompanions} disabled={isLoading}>Select Companion</button>
                    </div>
                {/if}
            {/if}
        </div>
    </div>
    
    </main>

<dialog class="modal" bind:this={companionDialog} on:close={() => (isCompanionOpen = false)}>
  <div class="modal-box">
    <h3 class="font-bold text-lg">Your Companions</h3>
    <div class="py-4 space-y-4">
      {#if companions && companions.length > 0}
        {#each companions as companion}
          <div class="p-2 bg-base-100 rounded flex justify-between items-center">
            <div>
              <p class="font-bold">{companion.name}</p>
              <p class="text-xs">{companion.title}</p>
            </div>
            {#if companion.status !== 'active'}
              <button class="btn btn-sm btn-secondary" on:click={() => handleSetActiveCompanion(companion.id)} disabled={isLoading}>
                Set Active
              </button>
            {/if}
          </div>
        {/each}
      {:else}
        <p>You have not yet earned the trust of any companions.</p>
      {/if}
    </div>
    <div class="modal-action">
      <form method="dialog"><button class="btn" disabled={isLoading}>Close</button></form>
    </div>
  </div>
</dialog>