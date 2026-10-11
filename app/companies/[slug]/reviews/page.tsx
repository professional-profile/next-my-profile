import { Error } from "@components/error"
import { Pagination } from "@components/pagination"
import { RateDropdown } from "@components/rate-dropdown"
import RatingForm from "@components/rating-form"
import { RatingSummary } from "@components/rating-summary"
import { Sort } from "@components/sort"
import { getCurrentUser } from "@lib/account"
import { logError, logger } from "@lib/logger"
import { defaultLimit, getDateFormat, getLang, getResource, sort } from "@resources"
import { getCompanyService } from "@service/company"
import { RateFilter } from "@service/shared/rates"
import { Item } from "onecore"
import { buildFilter, buildSorts, formatDateTime, getRecordValue, getSortText, removeField, removePage, removeSort } from "web-one"
import Header from "../header"

const renderStar = (star: number) => {
  const percent = ((star * 100) / 5).toFixed(0) + "%"
  return <span className="review-item-stars" style={{ "--percent": percent } as React.CSSProperties}></span>
}

export default async function CompanyReviewsPage({
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

    const rate = await service.getRateSummary(company.id)
    const filter = buildFilter<RateFilter>(query, defaultLimit, ["time"])
    if (!filter.sort) {
      filter.sort = "-usefulCount"
    }
    filter.id = company.id
    filter.userId = account?.id

    const sortSearch = removeSort(query)
    const prefix = sortSearch ? `?${sortSearch}&` : "?"
    const sort0: Item = { id: "usefulSort", value: `-usefulCount`, text: resource.sort_useful_desc, fulltext: resource.sort_desc_useful_desc }
    const sort1: Item = { id: "timeDescSort", value: `-time`, text: resource.sort_time_desc, fulltext: resource.sort_desc_time_desc }
    const sort2: Item = { id: "timeAscSort", value: `time`, text: resource.sort_time_asc, fulltext: resource.sort_desc_time_asc }
    const sort3: Item = { id: "rateDescSort", value: `-rate`, text: resource.sort_rate_desc, fulltext: resource.sort_desc_rate_desc }
    const sort4: Item = { id: "rateAscSort", value: `rate`, text: resource.sort_rate_asc, fulltext: resource.sort_desc_rate_asc }
    const items = [sort0, sort1, sort2, sort3, sort4]
    const sortText = getSortText(items, filter.sort, resource.sort_desc_useful_desc)
    buildSorts(items, `${prefix}${sort}=`)

    if (filter.sort && filter.sort != "time" && filter.sort != "-time") {
      filter.sort = filter.sort + ",-time"
    }
    const { list, total } = await service.searchRates(filter, filter.limit, filter.page)

    const dateFormat = getDateFormat(lang)
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
      <div className="profile">
        <Header company={company} lang={lang} />
        <div className="profile-body">
          <header>
            <h3>{resource.reviews}</h3>
          </header>
          <div>
            <div className="rating-summary-container">
              <RatingSummary rate={rate} />
            </div>
            {account && (
              <RatingForm
                id={company.id}
                api="/api/companies"
                header={resource.write_a_review}
                reviewPlaceHolder={resource.review_placeholder}
                cancelText={resource.cancel}
                submitText={resource.submit}
                errorHeader={resource.header_error}
                errorMessage={resource.error_network}
                error401={resource.error_401}
                warningHeader={resource.header_warning}
                reviewRequiredError={resource.review_required_error}
                successHeader={resource.header_success}
                successMessage={resource.review_success}
              />
            )}
            <div id="reviewBody">
              <form id="reviewsForm" name="reviewsForm" className="form" noValidate>
                <section className="row search-group">
                  <div className="col s12 m6 flex-direction-row">
                    <Sort id="sortBtn" className="sort" text={sortText} items={items} dropDownId="sortDropdown" />
                    <RateDropdown id="rateBtn" className="rate" text={rateText} items={rates} dropDownId="rateDropdown" />
                  </div>
                  <Pagination className="col s12 m6 l4 xl3" total={total} size={filter.limit} page={filter.page} search={search} />
                </section>
              </form>
              <ul className="row list">
                {list.map((item, i) => (
                  <li className="col s12 m6 xl3 review-item" key={item.id + i}>
                    <header>
                      <strong>{item.displayName}</strong>
                      {renderStar(item.rate)}
                    </header>
                    <p className="center-align-items">{formatDateTime(item.time, dateFormat)}</p>
                    <p>{item.review}</p>
                    <footer>
                      <span className="center-align-items">
                        {resource.useful_review_description}
                        {item.reaction > 0 ? <i className="material-icons highlight">thumb_up</i> : <i className="material-icons">thumb_up</i>}
                      </span>
                      {item.usefulCount > 0 && (
                        <span className="center-align-items">
                          <span className="useful">{item.usefulCount}</span>
                          <i className="material-icons">thumb_up</i>
                        </span>
                      )}
                    </footer>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (err) {
    logError(err)
    return <Error title={resource.error_500_title} message={resource.error_500_message} />
  }
}
