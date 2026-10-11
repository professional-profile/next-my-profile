import { Error } from "@components/error"
import FollowButton from "@components/follow-button"
import { Pagination } from "@components/pagination"
import Search from "@components/search"
import SearchResultMessage from "@components/search-result-message"
import { getCurrentUser } from "@lib/account"
import { logError } from "@lib/logger"
import { defaultLimit, getLang, getLangSearch, getResource, limits } from "@resources"
import { CompanyFilter, getCompanyService } from "@service/company"
import Form from "next/form"
import Link from "next/link"
import { buildFilter, removeLimit, removePage } from "web-one"

export default async function CompaniesForm({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const account = await getCurrentUser()
  const query = await searchParams
  const lang = getLang(query, account?.language)
  const resource = getResource(lang)

  const filter = buildFilter<CompanyFilter>(query, defaultLimit, ["publishedAt"])
  filter.userId = account?.id

  const service = getCompanyService()
  try {
    const { list, total } = await service.search(filter, filter.limit, filter.page)

    const langSearch = getLangSearch(lang)
    const search = removePage(query)
    const limitSearch = removeLimit(query)

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
                placeholder={resource.keyword}
              />
              <Pagination className="col s12 l4 xl3" total={total} size={filter.limit} page={filter.page} search={search} />
              {langSearch && <input type="hidden" id="lang" name="lang" value={lang} />}
            </section>
          </Form>
          <ul className="row list">
            {list.map((item) => (
              <li key={item.id} className="col s12 l6 img-item">
                <img src={item.logo || ""} alt="Company logo" />
                <Link href={`/companies/${item.slug}${langSearch}`} prefetch={false}>
                  {item.name}
                </Link>
                <button type="button" className="btn-detail" />
                <p className="center-align-items">
                  {item.industry}
                  {account && (
                    <FollowButton
                      id={item.id}
                      followed={item.followedAt != null}
                      api="/api/companies"
                      followedMessage={resource.company_follow_success}
                      unfollowedMessage={resource.company_unfollow_success}
                      errorHeader={resource.header_error}
                      errorMessage={resource.error_network}
                      error401={resource.error_401}
                    />
                  )}
                </p>
              </li>
            ))}
          </ul>
          <SearchResultMessage page={filter.page} limit={filter.limit} length={list.length} total={total} />
        </div>
      </div>
    )
  } catch (err) {
    logError(err)
    return <Error title={resource.error_404_title} message={resource.error_404_message} />
  }
}
