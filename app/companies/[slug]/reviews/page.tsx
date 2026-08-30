import CompanyHeader from "@components/company/header"
import CompanyReviews from "@components/company/reviews"
import { Error } from "@components/error"
import { logger, toString } from "@lib/logger"
import { getResource } from "@resources"
import { getCompanyService } from "@service/company"
import { headers } from "next/headers"
import { getCurrentUser } from "@lib/account"

export default async function CompanyReviewsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const headerList = await headers()
  const pathname = headerList.get("x-current-path")

  const resource = getResource("en")
  const { slug } = await params

  const service = getCompanyService()

  try {
    const account = await getCurrentUser()

   const company = await service.load(
   slug,
   account?.id
)

    if (!company) {
      return (
        <Error
          title={resource.error_404_title}
          message={resource.error_404_message}
        />
      )
    }

    return (
      <div id="companyPage" className="profile">
        <CompanyHeader
    company={company}
     activeTab="reviews"
/>

       

        <CompanyReviews company={company} />
      </div>
    )
  } catch (err) {
    logger.error(`Error at ${pathname}: ${toString(err)}`)

    return (
      <Error
        title={resource.error_500_title}
        message={resource.error_500_message}
      />
    )
  }
}