'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Rocket, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#070B14]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Rocket className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-white">Smart Study Tracker</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-sm text-slate-400 hover:text-white transition-colors">How it works</Link>
            <Link href="#testimonials" className="text-sm text-slate-400 hover:text-white transition-colors">Testimonials</Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/sign-in"
              className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="px-4 py-2 text-sm bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-[0_0_20px_rgba(124,58,237,0.4)]"
            >
              Get Started Free
            </Link>
          </div>

          <button
            className="md:hidden text-slate-400 hover:text-white"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-[#0A0F1E] border-b border-white/5 px-4 py-4 space-y-3">
          <Link href="#features" className="block text-sm text-slate-400 hover:text-white py-2" onClick={() => setOpen(false)}>Features</Link>
          <Link href="#how-it-works" className="block text-sm text-slate-400 hover:text-white py-2" onClick={() => setOpen(false)}>How it works</Link>
          <Link href="/sign-in" className="block text-sm text-slate-300 hover:text-white py-2">Sign in</Link>
          <Link href="/sign-up" className="block w-full text-center py-2 bg-violet-600 text-white rounded-lg text-sm font-medium">Get Started Free</Link>
        </div>
      )}
    </nav>
  );
}
