import Link from 'next/link';
import { ArrowRight, Rocket } from 'lucide-react';

export default function CTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-violet-600/25 rounded-full blur-[100px]" />
      </div>
      <div className="relative max-w-3xl mx-auto px-4 text-center">
        <div className="bg-[#0A0F1E] border border-violet-500/20 rounded-3xl p-12 shadow-[0_0_60px_rgba(124,58,237,0.15)]">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-2xl flex items-center justify-center animate-float">
              <Rocket className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">ace your exam?</span>
          </h2>
          <p className="text-slate-400 mb-8 text-lg">
            Join thousands of students who have transformed their study habits with Smart Study Tracker.
            Start your journey today — it's completely free.
          </p>
          <Link
            href="/sign-up"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-xl font-semibold text-lg transition-all duration-300 hover:from-violet-500 hover:to-violet-400 hover:shadow-[0_0_40px_rgba(124,58,237,0.5)] hover:-translate-y-0.5"
          >
            Get Started — It's Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="mt-4 text-sm text-slate-500">No credit card required. Start in 30 seconds.</p>
        </div>
      </div>
    </section>
  );
}
