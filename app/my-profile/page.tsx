import { getCurrentUser } from "@lib/account"
import { getLang, getResource } from "@resources"

export default async function SettingsForm({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const account = await getCurrentUser()
  const query = await searchParams
  const lang = getLang(query, account?.language)
  const resource = getResource(lang)

  return (
    <div>
      <header>
        <h2>{resource.profiles} My Profile</h2>
      </header>
      <div className="main-body"></div>
    </div>
  )
}
