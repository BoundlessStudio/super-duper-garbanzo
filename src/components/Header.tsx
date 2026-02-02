import { Link } from "@tanstack/react-router";

export default function Header() {
	return (
		<header className="w-full border-b border-slate-800 bg-slate-900/80 text-slate-50 backdrop-blur">
			<div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
				<Link to="/" className="text-lg font-semibold tracking-tight hover:text-white">
					super-duper-garbanzo
				</Link>
				<nav className="flex items-center gap-4 text-sm font-medium text-slate-300">
					<Link to="/" className="hover:text-white">
						Home
					</Link>
				</nav>
			</div>
		</header>
	);
}
