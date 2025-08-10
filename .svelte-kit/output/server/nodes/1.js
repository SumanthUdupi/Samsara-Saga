

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.qq-vD6zT.js","_app/immutable/chunks/CsXtci7w.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/Dv-H1_ii.js"];
export const stylesheets = [];
export const fonts = [];
