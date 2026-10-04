import { Error } from "@components/error"
import { Pagination } from "@components/pagination"
import SaveButton from "@components/save-button"
import Search from "@components/search"
import { Item, Sort } from "@components/sort"
import { getCurrentUser } from "@lib/account"
import { logError } from "@lib/logger"
import { defaultLimit, getDateFormat, getLang, getLangSearch, getResource, limits, sort } from "@resources"
import { getJobService } from "@service/job"
import { JobFilter, Published } from "@service/shared/job"
import Form from "next/form"
import Link from "next/link"
import { buildFilter, datetimeToString, formatDateTime, removeLimit, removePage, removeSort } from "web-one"

export default async function Jobs({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const account = await getCurrentUser()
  const query = await searchParams
  const lang = getLang(query, account?.language)
  const resource = getResource(lang)

  const filter = buildFilter<JobFilter>(query, defaultLimit, ["publishedAt"])
  if (!filter.sort) {
    filter.sort = "-publishedAt"
  }
  filter.status = Published
  filter.userId = account?.id

  const service = getJobService()
  try {
    const { list, total } = await service.search(filter, filter.limit, filter.page)

    const dateFormat = getDateFormat(lang)
    const langSearch = getLangSearch(lang)
    const search = removePage(query)
    const limitSearch = removeLimit(query)

    const sortSearch = removeSort(query)
    const prefix = sortSearch ? `?${sortSearch}&` : "?"
    const sort1: Item = { id: "timeDescSort", value: `${prefix}${sort}=-publishedAt`, text: resource.sort_time_desc }
    const sort2: Item = { id: "timeAscSort", value: `${prefix}${sort}=publishedAt`, text: resource.sort_time_asc }
    const sortText = filter.sort == "publishedAt" ? resource.sort_desc_time_asc : resource.sort_desc_time_desc
    const items = [sort1, sort2]

    return (
      <div>
        <header>
          <h2>{resource.jobs}</h2>
        </header>
        <div className="main-body">
          <Form id="jobsForm" name="jobsForm" className="form" noValidate={true} action="/jobs">
            <section className="row search-group">
              <Search
                className="col s12 m6 l4 xl6 search-input"
                limit={filter.limit}
                limits={limits}
                limitSearch={limitSearch}
                id="q"
                name="q"
                defaultValue={filter.q}
                maxLength={40}
                placeholder={resource.keyword}
              />
              <Sort id="sortBtn" className="col s12 m6 l4 xl3 sort" text={sortText} items={items} dropDownId="sortDropdown" />
              <Pagination className="col s12 m12 l6" total={total} size={filter.limit} page={filter.page} search={search} />
            </section>
            <section className="row search-group inline advance-search" hidden>
              <label className="col s12 m6">
                {resource.published_at_from}
                <input
                  type="datetime-local"
                  step=".010"
                  id="publishedAt_min"
                  name="publishedAt.min"
                  data-field="publishedAt.min"
                  defaultValue={datetimeToString(filter.publishedAt?.min)}
                />
              </label>
              <label className="col s12 m6">
                {resource.published_at_to}
                <input
                  type="datetime-local"
                  step=".010"
                  id="publishedAt_max"
                  name="publishedAt.max"
                  data-field="publishedAt.max"
                  defaultValue={datetimeToString(filter.publishedAt?.max)}
                />
              </label>
            </section>
            {langSearch && <input type="hidden" id="lang" name="lang" value={lang} />}
          </Form>
          <ul className="row list card-grid">
            {list.map((item, i) => {
              return (
                <li key={i} className="col s12 m6 img-item">
                  <img src={item.logo} alt="Company logo" />
                  <Link href={`/jobs/${item.slug}${langSearch}`} prefetch={false}>
                    {item.title}
                  </Link>
                  <button className="btn-detail"></button>
                  <p className="center-align-items">
                    {formatDateTime(item.publishedAt, dateFormat)}
                    <SaveButton
                      id={item.id}
                      saved={item.savedAt != null}
                      api="/api/jobs"
                      savedMessage={resource.job_save_success}
                      unsavedMessage={resource.job_unsave_success}
                      errorHeader={resource.header_error}
                      errorMessage={resource.error_network}
                      error401={resource.error_401}
                    />
                  </p>
                  <p>
                    {item.location} {item.quantity}
                  </p>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    )
  } catch (err) {
    logError(err)
    return <Error title={resource.error_500_title} message={resource.error_500_message} />
  }
}
