import { Outlet, createRootRoute } from "@tanstack/react-router";

import Header from "../components/Header";

export const rootRoute = createRootRoute({
	component: () => (
		<div className="min-h-screen bg-slate-950 text-slate-50">
			<Header />
			<main>
				<Outlet />
			</main>
		</div>
	),
});
