import { Error } from "@components/error"
import { getCurrentUser } from "@lib/account"
import { logError, logger } from "@lib/logger"
import { getResource } from "@resources"
import { getCompanyService } from "@service/company"
import CompanyHeader from "../_components/header"
import CompanyOverview from "../_components/overview"

export default async function CompanyDetail({ params }: { params: Promise<{ slug: string }> }) {
  const resource = getResource("en")
  const { slug } = await params

  const service = getCompanyService()

  try {
    const account = await getCurrentUser()
    const company = await service.load(slug, account?.id)
    if (!company) {
      logger.warn(`Company not found: ${slug}`)
      return <Error title={resource.error_404_title} message={resource.error_404_message} />
    }

    return (
      <div className="profile">
        <CompanyHeader company={company} activeTab="overview" />
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
