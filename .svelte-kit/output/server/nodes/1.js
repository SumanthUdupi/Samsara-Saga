

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.BB8mqhU0.js","_app/immutable/chunks/C-jgt7Lg.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/BIS6UBs9.js"];
export const stylesheets = [];
export const fonts = [];
