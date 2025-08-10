type DynamicRoutes = {
	"/api/converse/[npcId]": { npcId: string }
};

type Layouts = {
	"/": { npcId?: string };
	"/api": { npcId?: string };
	"/api/action": undefined;
	"/api/converse": { npcId?: string };
	"/api/converse/[npcId]": { npcId: string };
	"/api/craft": undefined;
	"/api/create-character": undefined;
	"/api/recipes": undefined;
	"/api/sanghas": undefined;
	"/game": undefined
};

export type RouteId = "/" | "/api" | "/api/action" | "/api/converse" | "/api/converse/[npcId]" | "/api/craft" | "/api/create-character" | "/api/recipes" | "/api/sanghas" | "/game";

export type RouteParams<T extends RouteId> = T extends keyof DynamicRoutes ? DynamicRoutes[T] : Record<string, never>;

export type LayoutParams<T extends RouteId> = Layouts[T] | Record<string, never>;

export type Pathname = "/" | "/api" | "/api/action" | "/api/converse" | `/api/converse/${string}` & {} | "/api/craft" | "/api/create-character" | "/api/recipes" | "/api/sanghas" | "/game";

export type ResolvedPathname = `${"" | `/${string}`}${Pathname}`;

export type Asset = never;