import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./__root";

const Home = () => {
	return (
		<div className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-4xl flex-col gap-6 px-4 py-12">
			<div className="space-y-3">
				<p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
					TanStack Start
				</p>
				<h1 className="text-4xl font-semibold leading-tight text-white">
					Basic starter ready for your routes.
				</h1>
				<p className="text-base text-slate-300">
					The app is back to the minimal TanStack layout. Add new routes under
					<code className="mx-2 rounded bg-slate-800 px-2 py-1 text-sm text-slate-100">src/routes</code>
					and update the root shell in <code className="mx-2 rounded bg-slate-800 px-2 py-1 text-sm text-slate-100">src/routes/__root.tsx</code>.
				</p>
			</div>

			<div className="grid gap-4 rounded-xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
				<h2 className="text-lg font-semibold text-white">Quick steps</h2>
				<ul className="space-y-2 text-sm text-slate-200">
					<li>• Run <code className="rounded bg-slate-800 px-2 py-1 text-slate-100">pnpm dev</code> and open http://localhost:3000.</li>
					<li>• Create a route file like <code className="rounded bg-slate-800 px-2 py-1 text-slate-100">src/routes/about.tsx</code> to add pages.</li>
					<li>• Use <code className="rounded bg-slate-800 px-2 py-1 text-slate-100">pnpm build</code> and <code className="rounded bg-slate-800 px-2 py-1 text-slate-100">pnpm preview</code> to test production output.</li>
				</ul>
			</div>
		</div>
	);
};

export const indexRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/",
	component: Home,
});

export default Home;
