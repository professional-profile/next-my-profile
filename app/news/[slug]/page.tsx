import Link from "next/link"
import { Error } from "@components/error"
import { RatingSummary } from "@components/rating-summary"
import ArticleSaveButton from "@components/article-save-button"
import { getCurrentUser } from "@lib/account"
import { logger, toString } from "@lib/logger"
import {
  getDateFormat,
  getLang,
  getLangSearch,
  getResource,
} from "@resources"
import { getArticleService } from "@service/article"
import { formatRate } from "@service/shared/rate"
import { headers } from "next/headers"
import { formatDateTime } from "web-one"

export default async function Article({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<
    Record<string, string | string[] | undefined>
  >
}) {
  const query = await searchParams

  const lang = getLang(query)
  const resource = getResource(lang)
  const langSearch = getLangSearch(lang)

  const { slug } = await params

  const account = await getCurrentUser()
  const service = getArticleService()

  const fromCompany =
    query.from === "company" &&
    typeof query.company === "string"
      ? query.company
      : null

  const backHref = fromCompany
    ? `/companies/${fromCompany}/articles`
    : "/news"

  const backToArticleReview =
    fromCompany
      ? `/news/${slug}/review${langSearch}${langSearch ? "&" : "?"}from=company&company=${fromCompany}`
      : `/news/${slug}/review${langSearch}`

  try {
    const article = await service.load(
      slug,
      account?.id
    )

    if (!article) {
      logger.warn(
        `Article not found: ${slug}`
      )

      return (
        <Error
          title={resource.error_404_title}
          message={resource.error_404_message}
        />
      )
    }

    const summary =
      await service.getRateSummary(article.id)

    const rate = formatRate(summary)

    const dateFormat = getDateFormat(lang)

    return (
      <article className="article">
        <header>
          <Link
            href={backHref}
            className="btn-back"
            id="backBtn"
          >
          </Link>

          <h2>{article.title}</h2>
        </header>

        <div className="article-body">
          <h4 className="article-description">
            {article.description}
          </h4>

          <h4 className="article-meta center-align-items">
            {formatDateTime(
              article.publishedAt,
              dateFormat
            )}

            {account && (
              <ArticleSaveButton
                slug={article.slug}
                saved={Boolean(article.savedAt)}
              />
            )}
          </h4>

          <h4 className="rating-title">
            <Link href={backToArticleReview}>
              {resource.ratings_and_reviews}
            </Link>
          </h4>

          <div className="rating-summary-container">
            <RatingSummary rate={rate} />
          </div>

          <div
            className="article-content"
            dangerouslySetInnerHTML={{
              __html:
                article.content || "",
            }}
          />
        </div>
      </article>
    )
  } catch (err) {
    const headerList = await headers()
    const pathname =
      headerList.get("x-current-path")

    logger.error(
      `Error at ${pathname}: ${toString(err)}`
    )

    return (
      <Error
        title={resource.error_500_title}
        message={resource.error_500_message}
      />
    )
  }
}