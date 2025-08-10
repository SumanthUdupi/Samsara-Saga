<script lang="ts">
  import type { PageData } from './$types';
  import { invalidateAll } from '$app/navigation';

  export let data: PageData;

  // This reactive block automatically updates our local state when `data` reloads
  $: ({ playerState, exits } = data);
  let localPlayerState = { ...playerState };
  
  // State variables for UI
  let narrativeLog: { type: 'action' | 'narrative', text: string }[] = [];
  let isLoading = false;
  let isInventoryOpen = false;
  let inventoryItems: { name: string, description: string, quantity: number }[] = [];
  let isCraftingOpen = false;
  let availableRecipes: any[] = [];
  let craftMessage = '';

  // This reactive statement resets the narrative log whenever the player's location changes
  $: if (localPlayerState.current_location_id) {
    narrativeLog = [{ type: 'narrative', text: localPlayerState.location_description }];
  }
  
  async function handleAction(actionType: string, actionText: string, payload: any = {}) {
    isLoading = true;
    if (actionType !== 'CHECK_INVENTORY') {
      narrativeLog = [...narrativeLog, { type: 'action', text: `> ${actionText}` }];
    }

    try {
      const response = await fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType, payload })
      });

      if (!response.ok) {
          const err = await response.json();
          throw new Error(err.message || 'Action failed');
      }
      const result = await response.json();
      
      if (result.narrative) {
        narrativeLog = [...narrativeLog, { type: 'narrative', text: result.narrative }];
      }
      if (result.newKarmaScore !== undefined) {
        localPlayerState.karma_score = result.newKarmaScore;
      }
      if (result.inventory) {
        inventoryItems = result.inventory;
        isInventoryOpen = true;
      }
      
      // If the action was a successful move, invalidate all data.
      // This tells SvelteKit to re-run the `load` function and get fresh data
      // for the new location, including new exits.
      if (actionType === 'MOVE' && result.success) {
        await invalidateAll();
      }
    } catch (error: any) {
      console.error(error);
      if (actionType !== 'CHECK_INVENTORY') {
        narrativeLog = [...narrativeLog, { type: 'narrative', text: error.message || 'You try, but nothing happens.' }];
      }
    } finally {
      isLoading = false;
    }
  }

  async function openCrafting() {
    isLoading = true;
    const response = await fetch('/api/recipes');
    const data = await response.json();
    availableRecipes = data.recipes;
    craftMessage = '';
    isCraftingOpen = true;
    isLoading = false;
  }

  async function handleCraft(recipeId: number) {
    craftMessage = 'Crafting...';
    const response = await fetch('/api/craft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipeId })
    });
    const result = await response.json();
    craftMessage = result.message;
  }
</script>

<main class="container mx-auto p-4 md:p-8 font-serif">
  
  <div class="card w-full bg-base-200 shadow-lg mb-8">
    <div class="card-body">
      <h2 class="card-title text-2xl border-b-2 border-base-300 pb-2">{localPlayerState.location_name}</h2>
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

  <div class="card w-full bg-base-200 shadow-lg mb-8">
    <div class="card-body">
      <h3 class="card-title">What is your will?</h3>
      <div class="join mt-4 flex-wrap">
        <button class="btn btn-primary join-item" on:click={() => handleAction('LOOK_AROUND', 'Look Around')} disabled={isLoading}>Look Around</button>
        <button class="btn btn-primary join-item" on:click={() => handleAction('MEDITATE', 'Meditate')} disabled={isLoading}>Meditate</button>
        <button class="btn btn-secondary join-item" on:click={() => handleAction('CHECK_INVENTORY', 'Check Inventory')} disabled={isLoading}>Inventory</button>
        <button class="btn btn-secondary join-item" on:click={openCrafting} disabled={isLoading}>Craft</button>
      </div>
    </div>
  </div>

  <div class="card w-full bg-base-200 shadow-lg">
    <div class="card-body">
      <h3 class="card-title">Passages</h3>
      <div class="py-2 space-y-2">
        {#if exits && exits.length > 0}
          {#each exits as exit}
            <div>
              <button 
                class="btn btn-ghost text-left justify-start w-full h-auto py-2"
                on:click={() => handleAction('MOVE', `Move towards ${exit.to_location_name}`, { targetLocationId: exit.to_location_id })}
                disabled={isLoading}
              >
                <div class="flex flex-col items-start">
                  <span class="text-primary font-bold">» To {exit.to_location_name}</span>
                  <span class="text-sm normal-case font-normal italic opacity-80 whitespace-normal">{exit.description}</span>
                </div>
              </button>
            </div>
          {/each}
        {:else}
          <p>There are no obvious paths from here.</p>
        {/if}
      </div>
    </div>
  </div>
</main>

<dialog class="modal" bind:open={isInventoryOpen}>
    <div class="modal-box">
        <h3 class="font-bold text-lg">Your Inventory</h3>
        <div class="py-4 space-y-4">
            {#if inventoryItems.length > 0}
                {#each inventoryItems as item}
                    <div>
                        <p class="font-bold">{item.name} (x{item.quantity})</p>
                        <p class="text-sm opacity-80">{item.description}</p>
                    </div>
                {/each}
            {:else}
                <p>You are carrying nothing.</p>
            {/if}
        </div>
        <div class="modal-action">
            <form method="dialog"><button class="btn">Close</button></form>
        </div>
    </div>
</dialog>

<dialog class="modal" bind:open={isCraftingOpen}>
  <div class="modal-box max-w-2xl">
    <h3 class="font-bold text-lg">Shilpa Shastra: Crafting</h3>
    <p class="py-2 text-sm opacity-80">Combine items of spiritual significance.</p>
    <div class="py-4 space-y-4">
      {#each availableRecipes as recipe}
        <div class="p-4 rounded-lg bg-base-100">
          <p class="font-bold">Create: {recipe.product_name}</p>
          <p class="text-sm opacity-80">{recipe.product_description}</p>
          <div class="card-actions justify-end">
            <button class="btn btn-primary btn-sm" on:click={() => handleCraft(recipe.id)}>Craft</button>
          </div>
        </div>
      {/each}
    </div>
    {#if craftMessage}<p class="text-center text-accent">{craftMessage}</p>{/if}
    <div class="modal-action">
      <form method="dialog"><button class="btn">Close</button></form>
    </div>
  </div>
</dialog>