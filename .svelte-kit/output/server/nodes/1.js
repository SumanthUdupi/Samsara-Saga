

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.CNQ8shI0.js","_app/immutable/chunks/Dd9lyJPl.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/BiTq1VgM.js"];
export const stylesheets = [];
export const fonts = [];
