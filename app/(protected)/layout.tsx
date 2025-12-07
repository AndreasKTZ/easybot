import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProtectedLayoutClient } from "./layout-client"

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect til login hvis ikke autentificeret
  if (!user) {
    redirect("/login")
  }

  return <ProtectedLayoutClient user={user}>{children}</ProtectedLayoutClient>
}
