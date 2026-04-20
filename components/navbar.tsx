import Link from "next/link";

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">PH</span>
          </div>
          <span className="font-semibold text-lg text-slate-900">ProjectHub</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/auth/sign-in">
            <button className="text-sm text-slate-600 hover:text-slate-900 transition px-3 py-1.5">Log in</button>
          </Link>
          <Link href="/auth/sign-in">
            <button className="text-sm bg-violet-600 hover:bg-violet-700 text-white px-4 py-1.5 rounded-lg transition">Get Started</button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
