import { Error } from "@components/error"
import { getCurrentUser } from "@lib/account"
import { logError, logger } from "@lib/logger"
import { getLang, getResource } from "@resources"
import { getCompanyService } from "@service/company"
import Header from "./header"
import CompanyOverview from "./overview"

export default async function CompanyPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const account = await getCurrentUser()
  const query = await searchParams
  const lang = getLang(query, account?.language)
  const resource = getResource(lang)

  const service = getCompanyService()
  try {
    const { slug } = await params
    const company = await service.load(slug, account?.id)
    if (!company) {
      logger.warn(`Company not found: ${slug}`)
      return <Error title={resource.error_404_title} message={resource.error_404_message} />
    }

    return (
      <div className="profile">
        <Header company={company} activeTab="overview" />
        <div className="profile-body">
          <CompanyOverview company={company} />
        </div>
      </div>
    )
  } catch (err) {
    logError(err)
    return <Error title={resource.error_500_title} message={resource.error_500_message} />
  }
}
