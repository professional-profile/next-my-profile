import CompanyFollowButton from "@components/company-follow-button"
import { Error } from "@components/error"
import { Pagination } from "@components/pagination"
import Search from "@components/search"
import SearchResultMessage from "@components/search-result-message"
import { getCurrentUser } from "@lib/account"
import { logger, toString } from "@lib/logger"
import { defaultLimit, getLang, getLangSearch, getResource, isDefaultLang, limits } from "@resources"
import { CompanyFilter, getCompanyService } from "@service/company"
import Form from "next/form"
import { headers } from "next/headers"
import Link from "next/link"
import { buildFilter, removeLimit, removePage } from "web-one"

export default async function CompaniesForm({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams

  const lang = getLang(query)
  const resource = getResource(lang)

  const filter = buildFilter<CompanyFilter>(query, defaultLimit, ["publishedAt"])

  const service = getCompanyService()

  try {
    const user = await getCurrentUser()

    if (user) {
      filter.userId = user.id
    }

    const { list, total } = await service.search(filter, filter.limit, filter.page)

    const langSearch = getLangSearch(lang)

    const search = removePage(query)
    const limitSearch = removeLimit(query)

    const currentPage = filter.page ?? 1
    const currentLimit = filter.limit ?? defaultLimit

    const from = list.length > 0 ? (currentPage - 1) * currentLimit + 1 : 0

    const to = list.length > 0 ? from + list.length - 1 : 0

    return (
      <div>
        <header>
          <h2>{resource.companies}</h2>
        </header>

        <div className="main-body">
          <Form id="CompaniesForm" name="CompaniesForm" className="form" noValidate action="/companies">
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
                placeholder="Search"
              />

              <Pagination className="col s12 l4 xl3" total={total} size={filter.limit} page={filter.page} search={search} />

              {!isDefaultLang(lang) && <input type="hidden" id="lang" name="lang" value={lang} />}
            </section>
          </Form>

          <ul className="row list">
            {list.map((item) => (
              <li key={item.id} className="col s12 l6 img-item">
                <img src={item.logo || ""} alt={item.name} width={60} height={60} />

                <Link href={`/companies/${item.slug}${langSearch}`} prefetch={false}>
                  {item.name}
                </Link>

                <button type="button" className="btn-detail" />

                <p className="center-align-items">
                  {item.industry}

                  <CompanyFollowButton slug={item.slug} followed={Boolean(item.followingAt || item.followedAt)} />
                </p>
              </li>
            ))}
          </ul>

          <SearchResultMessage from={from} to={to} noData={list.length === 0} />
        </div>
      </div>
    )
  } catch (err) {
    const headerList = await headers()
    const pathname = headerList.get("x-current-path")

    logger.error(`Error at ${pathname}: ${toString(err)}`)

    return <Error title={resource.error_404_title} message={resource.error_404_message} />
  }
}
