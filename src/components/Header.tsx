import { Link } from '@tanstack/react-router'

export default function Header() {
  return (
    <header className="w-full bg-gray-800 text-white shadow-lg">
      <div className="flex w-full items-center justify-between gap-6 px-4 py-4 sm:px-8">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-semibold tracking-tight">
            <Link to="/" className="hover:text-white">
              super-duper-garbanzo
            </Link>
          </h1>
          <nav className="flex items-center gap-5 text-sm font-medium text-white/70">
            <Link to="/" className="hover:text-white">
              Home
            </Link>
            <Link to="/tasks" className="text-white hover:text-white">
              Tasks
            </Link>
          </nav>
        </div>
        <div className="flex items-center text-sm font-medium text-white/70">
          <Link to="/profile" className="hover:text-white">
            Profile
          </Link>
        </div>
      </div>
    </header>
  )
}
