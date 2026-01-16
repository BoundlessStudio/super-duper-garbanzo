import { Outlet } from 'react-router-dom';

export function Layout() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-neutral-800">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white font-medium tracking-tight">customware</span>
            <span className="text-neutral-500 text-sm">PORTAL</span>
          </div>
          
          <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center">
            <span className="text-xs font-medium text-neutral-400">JD</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}
