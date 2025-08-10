import { c as create_ssr_component } from "../../chunks/ssr.js";
import { e as escape } from "../../chunks/escape.js";
let rishiDialogue = "A new soul approaches. Before you begin your journey through samsara, we must discern the star that guides you. Are you ready to discover your nature?";
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<main class="container mx-auto p-4 font-serif flex flex-col items-center justify-center min-h-screen"><div class="card w-full max-w-2xl bg-base-200 shadow-xl"><div class="card-body"><h1 class="card-title text-2xl" data-svelte-h="svelte-1vgnxqa">The Celestial Rishi</h1> <p class="py-4 whitespace-pre-line">${escape(rishiDialogue)}</p> ${`<div class="card-actions justify-end"><button class="btn btn-primary" data-svelte-h="svelte-1yv8ulj">I am ready.</button></div>`} ${``}</div></div></main>`;
});
export {
  Layout as default
};
