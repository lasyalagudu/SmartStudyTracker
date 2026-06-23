"use client";

import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { Rocket } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#070B14] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              Smart Study Tracker
            </span>
          </Link>

          <h1 className="text-3xl font-bold text-white mb-2">
            Create your account
          </h1>
          <p className="text-slate-400">
            Start your exam preparation journey today
          </p>
        </div>

        <div className="flex justify-center">
          <SignUp
            routing="hash"
            signInUrl="/sign-in"
            fallbackRedirectUrl="/sso-callback"
            forceRedirectUrl="/sso-callback"
            appearance={{
              elements: {
                cardBox: "shadow-2xl",
                card: "bg-[#0A0F1E] border border-white/10",
                headerTitle: "text-white",
                headerSubtitle: "text-slate-400",
                socialButtonsBlockButton:
                  "bg-white/5 border-white/10 text-white hover:bg-white/10",
                formFieldLabel: "text-slate-300",
                formFieldInput:
                  "bg-white/5 border-white/10 text-white placeholder:text-slate-500",
                footerActionText: "text-slate-500",
                footerActionLink: "text-violet-400 hover:text-violet-300",
                formButtonPrimary:
                  "bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
