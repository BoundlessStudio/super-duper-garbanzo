import { createRouter } from "@tanstack/react-router";

import { rootRoute } from "./routes/__root";
import { indexRoute } from "./routes/index";

const routeTree = rootRoute.addChildren([indexRoute]);

export const router = createRouter({
	routeTree,
	defaultPreload: "intent",
	defaultNotFoundComponent: () => (
		<div className="mx-auto max-w-2xl px-4 py-12 text-center text-slate-200">
			<h1 className="text-2xl font-semibold">Page not found</h1>
			<p className="mt-2 text-slate-400">
				The page you're looking for doesn&apos;t exist or has moved.
			</p>
		</div>
	),
});
