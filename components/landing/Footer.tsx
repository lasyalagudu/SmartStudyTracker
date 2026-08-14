import Link from 'next/link';
import { Rocket } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Rocket className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white">Smart Study Tracker</span>
          </Link>

          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link href="/sign-in" className="hover:text-slate-300 transition-colors">Sign In</Link>
            <Link href="/sign-up" className="hover:text-slate-300 transition-colors">Sign Up</Link>
          </div>

          <p className="text-sm text-slate-600">
            © 2025 Smart Study Tracker. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
