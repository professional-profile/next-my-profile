import { BackButton } from "@components/client"
import { Error } from "@components/error"
import { RatingSummary } from "@components/rating-summary"
import SaveButton from "@components/save-button"
import { getCurrentUser } from "@lib/account"
import { logError, logger } from "@lib/logger"
import { getDateFormat, getLang, getLangSearch, getResource } from "@resources"
import { getArticleService } from "@service/article"
import Link from "next/link"
import { formatDateTime } from "web-one"

export default async function Article({
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
  const langSearch = getLangSearch(lang, account?.language)
  const { slug } = await params

  const service = getArticleService()
  try {
    const article = await service.load(slug, account?.id)

    if (!article) {
      logger.warn(`Article not found: ${slug}`)
      return <Error title={resource.error_404_title} message={resource.error_404_message} />
    }

    const rate = await service.getRateSummary(article.id)
    const dateFormat = getDateFormat(lang)
    return (
      <article className="article">
        <header>
          <BackButton id="backBtn" name="backBtn" className="btn-back" />
          <h2>{article.title}</h2>
        </header>
        <div className="article-body">
          <h4 className="article-description">{article.description}</h4>
          <h4 className="article-meta center-align-items">
            {formatDateTime(article.publishedAt, dateFormat)}
            {account && <SaveButton id={article.id} saved={article.savedAt != null} />}
          </h4>
          <h4 className="rating-title">
            <Link href={`/news/${slug}/review${langSearch}`}>{resource.ratings_and_reviews}</Link>
          </h4>
          <div className="rating-summary-container">
            <RatingSummary rate={rate} />
          </div>
          <div
            className="article-content"
            dangerouslySetInnerHTML={{
              __html: article.content || "",
            }}
          />
        </div>
      </article>
    )
  } catch (err) {
    logError(err)
    return <Error title={resource.error_500_title} message={resource.error_500_message} />
  }
}
