import { HugeiconsIcon } from "@hugeicons/react"
import { ChatBotIcon, SparklesIcon } from "@hugeicons-pro/core-solid-rounded"

import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
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
            <LoginForm />
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          © 2025 Easybot. Alle rettigheder forbeholdes.
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
            AI-drevet kundeservice
          </div>
          <h2 className="text-3xl font-bold mb-4">Velkommen tilbage!</h2>
          <p className="text-lg opacity-90">
            Log ind for at administrere dine chatbots og give dine kunder den bedste support.
          </p>
        </div>
      </div>
    </div>
  )
}
