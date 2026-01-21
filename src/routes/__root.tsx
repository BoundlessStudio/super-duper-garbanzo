import { createRootRoute, Outlet, Link } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { useState } from 'react'
import { X } from 'lucide-react'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-neutral-800">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-white font-medium tracking-tight">customware</span>
          </Link>
          
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-neutral-700 transition-colors"
            >
              <span className="text-xs font-medium text-neutral-400">JW</span>
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowProfileMenu(false)} 
                />
                <div className="absolute right-0 top-full mt-2 w-72 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl z-50">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-neutral-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center">
                        <span className="text-sm font-medium text-neutral-400">JW</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">John Wick</div>
                        <div className="text-xs text-neutral-500">john@customware.io</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowProfileMenu(false)}
                      className="p-1 text-neutral-500 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        <Outlet />
      </main>
      
      <TanStackRouterDevtools position="bottom-left" />
    </div>
  )
}
