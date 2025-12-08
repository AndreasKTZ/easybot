import { HugeiconsIcon } from "@hugeicons/react"
import { ChatBotIcon, SparklesIcon, Tick02Icon } from "@hugeicons-pro/core-solid-rounded"

import { SignupForm } from "@/components/signup-form"

const features = [
  "Opret ubegrænset antal chatbots",
  "AI-drevet med din egen vidensbase",
  "Nem integration på din hjemmeside",
  "Detaljeret analytics og indsigt",
]

export default function SignupPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-6 p-8 md:p-12">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2.5 font-semibold text-lg">
            <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-xl shadow-sm">
              <HugeiconsIcon icon={ChatBotIcon} size={20} />
            </div>
            <span>Easybot</span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <SignupForm />
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          © 2024 Easybot. Alle rettigheder forbeholdes.
        </p>
      </div>
      <div className="bg-primary relative hidden lg:flex flex-col items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-white/20" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-white/10" />
          <div className="absolute top-1/2 right-1/3 w-48 h-48 rounded-full bg-white/15" />
        </div>
        <div className="relative z-10 text-center text-primary-foreground max-w-md">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium mb-6">
            <HugeiconsIcon icon={SparklesIcon} size={16} />
            Kom i gang gratis
          </div>
          <h2 className="text-3xl font-bold mb-4">Byg din egen AI-assistent</h2>
          <p className="text-lg opacity-90 mb-8">
            Giv dine kunder support 24/7 med en intelligent chatbot, der kender din virksomhed.
          </p>
          <div className="bg-white/10 rounded-2xl p-6 text-left">
            <p className="font-medium mb-4 text-sm opacity-80">Det får du:</p>
            <ul className="space-y-3">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm">
                  <div className="flex size-5 items-center justify-center rounded-full bg-white/20">
                    <HugeiconsIcon icon={Tick02Icon} size={12} />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
