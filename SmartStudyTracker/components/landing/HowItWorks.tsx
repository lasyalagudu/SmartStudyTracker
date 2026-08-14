const steps = [
  {
    step: '01',
    title: 'Create your account',
    description: 'Sign up in seconds. No credit card required.',
  },
  {
    step: '02',
    title: 'Set up your exam',
    description: 'Select your target exam, target date, and add your subjects.',
  },
  {
    step: '03',
    title: 'Track your progress',
    description: 'Add topics, mark completion milestones, plan daily tasks, and use the timer.',
  },
  {
    step: '04',
    title: 'Ace the exam',
    description: 'Systematic tracking and consistent study habits lead to exam success.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">How it works</h2>
          <p className="text-slate-400 text-lg">Get started in minutes and track your preparation like a pro.</p>
        </div>

        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-violet-600/50 via-cyan-600/30 to-transparent hidden md:block" />
          <div className="space-y-12">
            {steps.map((step, i) => (
              <div key={step.step} className="flex gap-8 items-start">
                <div className="relative flex-shrink-0 hidden md:flex">
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-violet-800 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/20 font-bold text-lg text-white">
                    {step.step}
                  </div>
                </div>
                <div className="flex-1 bg-[#0A0F1E] border border-white/8 rounded-2xl p-6 hover:border-violet-500/20 transition-colors">
                  <div className="md:hidden text-xs text-violet-400 font-bold mb-2">Step {step.step}</div>
                  <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-slate-400">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
