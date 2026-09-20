import { Error } from "@components/error"
import RatingForm from "@components/rating-form"
import { RatingSummary } from "@components/rating-summary"
import ReviewFilter from "@components/review-filter"
import SearchResultMessage from "@components/search-result-message"
import { logError } from "@lib/logger"
import { getLang, getResource } from "@resources"
import { getArticleService } from "@service/article"
import { formatRate } from "@service/shared/rate"
import Link from "next/link"

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const query = await searchParams

  const lang = getLang(query)
  const resource = getResource(lang)

  const selectedRate = typeof query.rate === "string" ? `${query.rate} ☆` : resource.all

  const selectedSort = typeof query.sort === "string" ? query.sort : undefined

  const { slug } = await params

  const service = getArticleService()

  const backToArticle = query.from === "company" && typeof query.company === "string" ? `/news/${slug}?from=company&company=${query.company}` : `/news/${slug}`

  try {
    const article = await service.load(slug)

    if (!article) {
      return <Error title={resource.error_404_title} message={resource.error_404_message} />
    }

    const summary = await service.getRateSummary(article.id)

    const rate = formatRate(summary)

    return (
      <div>
        <header>
          <h2
            style={{
              fontSize: "20px",
              marginTop: "0px",
              marginLeft: "-15px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Link
              href={backToArticle}
              style={{
                color: "#000",
                textDecoration: "none",
                fontSize: "34px",
                fontWeight: 300,
                marginRight: "6px",
                lineHeight: 1,
              }}
            >
              ‹
            </Link>

            <span>{resource.ratings_and_reviews}</span>
          </h2>
        </header>

        <div className="main-body">
          <div className="rating-summary-container">
            <RatingSummary rate={rate} />
          </div>
          <RatingForm resource={resource} />
          <ReviewFilter resource={resource} selectedRate={selectedRate} selectedSort={selectedSort} />
          <SearchResultMessage total={0} page={1} limit={12} length={12} />
        </div>
      </div>
    )
  } catch (err) {
    logError(err)
    return <Error title={resource.error_500_title} message={resource.error_500_message} />
  }
}
