import { getCurrentUser } from "@lib/account"
import { getDefaultLang, getLang } from "@resources"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function LogoutPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const account = await getCurrentUser()
  const query = await searchParams
  const lang = getLang(query, account?.language)

  const cookieStore = await cookies()

  cookieStore.delete("accessToken")
  cookieStore.delete("rememberToken")

  const defaultLang = getDefaultLang()
  const r = lang !== defaultLang ? `?lang=${encodeURIComponent(lang)}` : ""
  redirect(`/login${r}`)
}
