<script lang="ts">
  import type { PageData } from './$types';
  import { invalidateAll } from '$app/navigation';
  import { slide } from 'svelte/transition';

  export let data: PageData;

  $: ({ playerState, exits, npcs, activeQuests, itemsInLocation } = data);
  let localPlayerState = { ...playerState };
  
  // State variables for UI
  let narrativeLog: { type: 'action' | 'narrative', text: string }[] = [];
  let isLoading = false;
  let inventoryItems: { name: string, description: string, quantity: number }[] = [];
  let availableRecipes: any[] = [];
  let craftMessage = '';

  // Conversation state
  let activeNpc: any = null;
  let conversationHistory: { role: string, text: string }[] = [];
  let playerMessage = '';

  // Quest state
  let questAcceptedMessage: string | null = null;
  let questCompletedMessage: string | null = null;

  // Dialog elements
  let inventoryModal: HTMLDialogElement;
  let craftingModal: HTMLDialogElement;
  let conversationModal: HTMLDialogElement;
  let sanghaModal: HTMLDialogElement; // Added this line

  // NEW state for the Sangha modal
  let isSanghaOpen = false;
  let availableSanghas: any[] = [];
  let sanghaMessage = '';
  let newSanghaName = '';
  let newSanghaMarga = 'Karma'; // Default to Karma Marga

  async function openSangha() {
    isLoading = true;
    sanghaMessage = '';
    const response = await fetch('/api/sanghas');
    const data = await response.json();
    availableSanghas = data.sanghas;
    // isSanghaOpen = true; // Removed this line
    sanghaModal.showModal(); // Added this line
    isLoading = false;
  }

  async function handleJoinSangha(sanghaId: number) {
    const response = await fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType: 'JOIN_SANGHA', payload: { sanghaId } })
    });
    const result = await response.json();
    sanghaMessage = result.message;
    await invalidateAll();
  }

  async function handleCreateSangha() {
    const response = await fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType: 'CREATE_SANGHA', payload: { sanghaName: newSanghaName, marga: newSanghaMarga } })
    });
    const result = await response.json();
    sanghaMessage = result.message;
    newSanghaName = '';
    await invalidateAll();
  }

  // This reactive statement resets the narrative log whenever the player's location changes
  $: if (localPlayerState.current_location_id) {
    narrativeLog = [...narrativeLog, { type: 'narrative', text: localPlayerState.location_description! }];
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
        inventoryModal.showModal();
      }
      
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
    craftingModal.showModal();
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

  function openConversation(npc: any) {
    activeNpc = npc;
    conversationHistory = [];
    conversationModal.showModal();
  }

  async function handleSendMessage() {
    if (!playerMessage.trim() || !activeNpc) return;

    const currentMessage = playerMessage;
    conversationHistory = [...conversationHistory, { role: 'user', text: currentMessage }];
    playerMessage = '';
    isLoading = true;

    try {
      const response = await fetch(`/api/converse/${activeNpc.id}` , {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentMessage })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from the void.');
      }

      const result = await response.json();
      conversationHistory = [...conversationHistory, { role: 'model', text: result.response }];

      if (result.quest_offered) {
        questAcceptedMessage = `New Quest: ${result.quest_offered.title}!`;
        setTimeout(() => questAcceptedMessage = null, 5000);
        await invalidateAll(); // Invalidate to show new active quest
      }
      if (result.quest_completed) {
        questCompletedMessage = `Quest Completed: ${result.quest_completed.title}! Karma +${result.quest_completed.karma}`; 
        setTimeout(() => questCompletedMessage = null, 5000);
        await invalidateAll(); // Invalidate to update karma and active quests
      }

    } catch (error) {
      console.error(error);
      conversationHistory = [...conversationHistory, { role: 'model', text: 'The connection fades... The void is silent.' }];
    } finally {
      isLoading = false;
    }
  }
</script>

<main class="container mx-auto p-4 md:p-8 font-serif">
  <div class="card w-full bg-base-200 shadow-lg mb-8">
    <div class="card-body">
      <h3 class="card-title">Your State of Being</h3>
      <p>Karma Score: <span class="font-bold text-accent">{localPlayerState.karma_score}</span></p>
      {#if localPlayerState.sangha_name}
        <p>Sangha: <span class="font-bold text-secondary">{localPlayerState.sangha_name} ({localPlayerState.sangha_marga} Marga)</span></p>
      {/if}
    </div>
  </div>

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
      
      {#if npcs && npcs.length > 0}
        <div class="divider">Beings Present</div>
        <div class="py-2 space-y-2">
          {#each npcs as npc}
            <div>
              <button 
                class="btn btn-ghost text-left justify-start w-full h-auto py-2"
                on:click={() => openConversation(npc)}
              >
                <div class="flex flex-col items-start">
                  <span class="text-secondary font-bold">» {npc.name}</span>
                  <span class="text-sm normal-case font-normal italic opacity-80 whitespace-normal">{npc.description}</span>
                </div>
              </button>
            </div>
          {/each}
        </div>
      {/if}

      {#if itemsInLocation && itemsInLocation.length > 0}
        <div class="divider">Objects of Interest</div>
        {#each itemsInLocation as item}
          <div class="p-2 rounded">
            <h4 class="font-bold">{item.name}</h4>
            <p class="text-sm opacity-80 mb-2">{item.description}</p>
            <button class="btn btn-xs btn-secondary" on:click={() => handleAction('GATHER_ITEM', `Gather ${item.name}`, { itemId: item.id })}>
              Gather
            </button>
          </div>
        {/each}
      {/if}
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
        <button class="btn btn-accent join-item" on:click={openSangha} disabled={isLoading}>Sangha</button>
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

<dialog class="modal" bind:this={inventoryModal}>
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

<dialog class="modal" bind:this={craftingModal}>
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

<dialog class="modal" bind:this={conversationModal}>
  <div class="modal-box max-w-4xl">
    {#if activeNpc}
      <h3 class="font-bold text-lg">Conversation with {activeNpc.name}</h3>
      <div class="py-4 space-y-4 max-h-96 overflow-y-auto">
        {#each conversationHistory as turn}
          <div class="chat ${turn.role === 'user' ? 'chat-end' : 'chat-start'}">
            <div class="chat-bubble ${turn.role === 'user' ? 'chat-bubble-primary' : 'chat-bubble-secondary'}">
              {turn.text}
            </div>
          </div>
        {/each}
        {#if isLoading}
          <div class="text-center py-4"><span class="loading loading-dots loading-md"></span></div>
        {/if}
      </div>
      <div class="form-control">
        <textarea bind:value={playerMessage} class="textarea textarea-bordered" placeholder="Speak your mind..." on:keydown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}></textarea>
        <button class="btn btn-primary mt-2" on:click={handleSendMessage} disabled={isLoading || !playerMessage.trim()}>Send</button>
      </div>
    {/if}
    <div class="modal-action">
      <form method="dialog"><button class="btn">Close</button></form>
    </div>
  </div>
</dialog>

<dialog class="modal" bind:this={sanghaModal}>
  <div class="modal-box max-w-2xl">
    <h3 class="font-bold text-lg">Spiritual Communities</h3>
    {#if !localPlayerState.sangha_id}
      <div class="divider">Join a Sangha</div>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        {#each availableSanghas as sangha}
          <div class="p-2 bg-base-100 rounded flex justify-between items-center">
            <div>
              <p class="font-bold">{sangha.name}</p>
              <p class="text-xs">{sangha.marga} Marga</p>
            </div>
            <button class="btn btn-sm btn-secondary" on:click={() => handleJoinSangha(sangha.id)}>Join</button>
          </div>
        {/each}
      </div>

      <div class="divider">Or Found a New Path</div>
      <form on:submit|preventDefault={handleCreateSangha} class="space-y-4">
          <input type="text" placeholder="Name of your Sangha..." class="input input-bordered w-full" bind:value={newSanghaName} required>
          <select class="select select-bordered w-full" bind:value={newSanghaMarga}>
              <option value="Karma">Karma Marga (Path of Action)</option>
              <option value="Bhakti">Bhakti Marga (Path of Devotion)</option>
              <option value="Jnana">Jnana Marga (Path of Knowledge)</option>
          </select>
          <button type="submit" class="btn btn-primary w-full">Found Sangha</button>
      </form>
    {:else}
      <p class="py-4">You are a member of the <span class="font-bold text-secondary">{localPlayerState.sangha_name}</span>, a community following the path of <span class="font-bold">{localPlayerState.sangha_marga}</span>.</p>
      {/if}

    {#if sanghaMessage}<p class="text-center text-accent pt-4">{sanghaMessage}</p>{/if}

    <div class="modal-action">
      <form method="dialog"><button class="btn" on:click={() => sanghaModal.close()}>Close</button></form>
    </div>
  </div>
</dialog>

{#if questAcceptedMessage}
    <div class="toast toast-top toast-center" transition:slide>
        <div class="alert alert-success">
            <span>{questAcceptedMessage}</span>
        </div>
    </div>
{/if}

{#if questCompletedMessage}
    <div class="toast toast-top toast-center" transition:slide>
        <div class="alert alert-success">
            <span>{questCompletedMessage}</span>
        </div>
    </div>
{/if}