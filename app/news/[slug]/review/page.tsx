import { BackButton } from "@components/client"
import { Error } from "@components/error"
import { Pagination } from "@components/pagination"
import { RateDropdown } from "@components/rate-dropdown"
import RatingForm from "@components/rating-form"
import { RatingSummary } from "@components/rating-summary"
import { Sort } from "@components/sort"
import { getCurrentUser } from "@lib/account"
import { logError, logger } from "@lib/logger"
import { defaultLimit, getLang, getResource, sort } from "@resources"
import { getArticleService } from "@service/article"
import { RateFilter } from "@service/shared/rates"
import { buildFilter, getRecordValue, getSortText, Item, removeField, removePage, removeSort } from "web-one"

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { slug } = await params
  const query = await searchParams
  const lang = getLang(query)
  const resource = getResource(lang)

  const filter = buildFilter<RateFilter>(query, defaultLimit, ["time"])
  if (!filter.sort) {
    filter.sort = "-usefulCount"
  }

  const service = getArticleService()
  try {
    const account = await getCurrentUser()
    const article = await service.load(slug)
    if (!article) {
      logger.warn(`Article not found: ${slug}`)
      return <Error title={resource.error_404_title} message={resource.error_404_message} />
    }

    const rate = await service.getRateSummary(article.id)

    filter.id = article.id
    filter.userId = account?.id

    const sortSearch = removeSort(query)
    const prefix = sortSearch ? `?${sortSearch}&` : "?"
    const sort0: Item = { id: "usefulSort", value: `${prefix}${sort}=-usefulCount`, text: resource.sort_useful_desc, fulltext: resource.sort_desc_useful_desc }
    const sort1: Item = { id: "timeDescSort", value: `${prefix}${sort}=-time`, text: resource.sort_time_desc, fulltext: resource.sort_desc_time_desc }
    const sort2: Item = { id: "timeAscSort", value: `${prefix}${sort}=time`, text: resource.sort_time_asc, fulltext: resource.sort_desc_time_asc }
    const sort3: Item = { id: "rateDescSort", value: `${prefix}${sort}=-rate`, text: resource.sort_rate_desc, fulltext: resource.sort_desc_rate_desc }
    const sort4: Item = { id: "rateAscSort", value: `${prefix}${sort}=rate`, text: resource.sort_rate_asc, fulltext: resource.sort_desc_rate_asc }
    const items = [sort0, sort1, sort2, sort3, sort4]
    const sortText = getSortText(items, filter.sort, resource.sort_desc_useful_desc)

    if (filter.sort && filter.sort != "time" && filter.sort != "-time") {
      filter.sort = filter.sort + ",-time"
    }
    const { list, total } = await service.searchRates(filter, filter.limit, filter.page)

    const search = removePage(query)

    let rateSearch = removeField(query, "rate")
    const srate = getRecordValue(query.rate)
    const rateText = typeof srate === "string" ? `${srate} ☆` : resource.all
    let ratePrefix = rateSearch ? `?${rateSearch}` : `?`
    const rates: Item[] = [{ id: "rateAll", value: `${ratePrefix}`, text: resource.all }]
    ratePrefix = rateSearch ? `?${rateSearch}&` : `?`
    for (let i = 1; i <= 5; i++) {
      rates.push({ id: `rate${i}`, value: `${ratePrefix}rate=${i}`, text: `${i} ☆` })
    }

    return (
      <div>
        <header>
          <BackButton id="backBtn" name="backBtn" className="btn-back" />
          <h2>{resource.ratings_and_reviews}</h2>
        </header>
        <div className="main-body">
          <div className="rating-summary-container">
            <RatingSummary rate={rate} />
          </div>
          {account && <RatingForm resource={resource} />}
          <form id="reviewsForm" name="reviewsForm" className="form" noValidate>
            <section className="row search-group">
              <div className="col s12 m6 flex-direction-row">
                <Sort id="sortBtn" className="sort" text={sortText} items={items} dropDownId="sortDropdown" />
                <RateDropdown id="rateBtn" className="rate" text={rateText} items={rates} dropDownId="rateDropdown" />
              </div>
              <Pagination className="col s12 m6" total={total} size={filter.limit} page={filter.page} search={search} />
            </section>
          </form>
          <ul className="row list">
            {list.map((item, i) => (
              <li className="col s12 m6 xl3 review-item" key={item.id + i}>
                <header>
                  <strong>{item.displayName}</strong>
                  <div className="review-item-stars"></div>
                </header>
                <p>{item.review}</p>
                <footer>
                  <span className="center-align-items">
                    <i className="material-icons highlight">thumb_up</i>
                  </span>
                  <span className="center-align-items">
                    <span className="useful">{item.usefulCount}</span>
                    <i className="material-icons">thumb_up</i>
                  </span>
                </footer>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  } catch (err) {
    logError(err)
    return <Error title={resource.error_500_title} message={resource.error_500_message} />
  }
}
