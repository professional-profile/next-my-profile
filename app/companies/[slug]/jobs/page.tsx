import { Error } from "@components/error"
import { Pagination } from "@components/pagination"
import Search from "@components/search"
import { Item, Sort } from "@components/sort"
import { getCurrentUser } from "@lib/account"
import { logError, logger } from "@lib/logger"
import { defaultLimit, getDateFormat, getLang, getResource, limits, sort } from "@resources"
import { getCompanyService } from "@service/company"
import { getJobService, JobFilter } from "@service/job"
import Form from "next/form"
import Link from "next/link"
import { buildFilter, formatDateTime, removeLimit, removePage, removeSort } from "web-one"
import CompanyHeader from "../header"

export default async function CompanyJobsPage({
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

  const filter = buildFilter<JobFilter>(query, defaultLimit, ["publishedAt"])

  const companyService = getCompanyService()
  const jobService = getJobService()

  try {
    const account = await getCurrentUser()

    const company = await companyService.load(slug, account?.id)

    if (!company) {
      logger.warn(`Company not found: ${slug}`)
      return <Error title={resource.error_404_title} message={resource.error_404_message} />
    }

    filter.companyId = company.id

    const { list, total } = await jobService.search(filter, filter.limit, filter.page)

    const dateFormat = getDateFormat(lang)

    const search = removePage(query)
    const limitSearch = removeLimit(query)
    const sortSearch = removeSort(query)

    const prefix = sortSearch ? `?${sortSearch}&` : "?"
    const sort1: Item = { id: "timeDescSort", value: `${prefix}${sort}=-publishedAt`, text: resource.sort_time_desc }
    const sort2: Item = { id: "timeAscSort", value: `${prefix}${sort}=publishedAt`, text: resource.sort_time_asc }
    const items = [sort1, sort2]

    const sortText = filter.sort === "publishedAt" ? resource.sort_desc_time_asc : resource.sort_desc_time_desc

    return (
      <div className="profile">
        <CompanyHeader company={company} activeTab="jobs" />
        <div className="profile-body">
          <header>
            <h3>{resource.jobs}</h3>
          </header>
          <Form id="jobsForm" name="jobsForm" className="form" noValidate action={`/companies/${company.slug}/jobs`}>
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
                placeholder={resource.search ?? "Search"}
              />
              <Sort id="sortBtn" className="col s12 m6 l4 xl3 sort" text={sortText} items={items} dropDownId="sortDropdown" />
              <Pagination className="col s12 l4 xl3" total={total} size={filter.limit} page={filter.page} search={search} />
            </section>
          </Form>
          <ul className="row list">
            {list.map((item: any) => (
              <li key={item.id} className="col s12 m6">
                <section className="card">
                  <Link href={`/jobs/${item.slug}`} prefetch={false}>
                    {item.title}
                  </Link>
                  {item.position && <p>{item.position}</p>}
                  {item.location && <p>{item.location}</p>}
                  {item.quantity && <p>Quantity: {item.quantity}</p>}
                  {item.publishedAt && <p>{formatDateTime(item.publishedAt, dateFormat)}</p>}
                  {item.description && <p>{item.description}</p>}
                </section>
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
