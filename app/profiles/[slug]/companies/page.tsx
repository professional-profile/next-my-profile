import { Error } from "@components/error"
import FollowButton from "@components/follow-button"
import { Pagination } from "@components/pagination"
import Search from "@components/search"
import SearchResultMessage from "@components/search-result-message"
import { Item, Sort } from "@components/sort"
import { getCurrentUser } from "@lib/account"
import { logError, logger } from "@lib/logger"
import { defaultLimit, getLang, getLangSearch, getResource, limits, sort } from "@resources"
import { CompanyFilter, getUserService } from "@service/user"
import Form from "next/form"
import Link from "next/link"
import { buildFilter, buildSorts, getSortText, removeLimit, removePage, removeSort } from "web-one"
import Header from "../header"

export default async function CompaniesPage({
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

  const filter = buildFilter<CompanyFilter>(query, defaultLimit, ["publishedAt"])
  if (!filter.sort) {
    filter.sort = "-followingAt"
  }
  //filter.status = Published
  filter.currentUserId = account?.id

  const service = getUserService()
  try {
    const { slug } = await params
    const user = await service.load(slug, account?.id)
    if (!user) {
      logger.warn(`User not found: ${slug}`)
      return <Error title={resource.error_404_title} message={resource.error_404_message} />
    }
    filter.userId = user.id

    const { list, total } = await service.getCompanies(filter, filter.limit, filter.page)

    const langSearch = getLangSearch(lang)
    const search = removePage(query)
    const limitSearch = removeLimit(query)

    const sortSearch = removeSort(query)
    const prefix = sortSearch ? `?${sortSearch}&` : `?`
    const sort1: Item = { id: "followingDescSort", value: "-followingAt", text: resource.sort_time_desc, fulltext: resource.sort_desc_time_desc }
    const sort2: Item = { id: "followingAscSort", value: "followingAt", text: resource.sort_time_asc, fulltext: resource.sort_desc_time_asc }
    const sort3: Item = { id: "nameAscSort", value: "name", text: resource.sort_name_asc, fulltext: resource.sort_desc_name_asc }
    const sort4: Item = { id: "nameDescSort", value: "-name", text: resource.sort_name_desc, fulltext: resource.sort_desc_name_desc }
    const items = [sort1, sort2, sort3, sort4]
    const sortText = getSortText(items, filter.sort, resource.sort_desc_time_desc)
    buildSorts(items, `${prefix}${sort}=`)

    return (
      <div className="profile">
        <Header user={user} lang={lang} />
        <div className="profile-body">
          <SearchResultMessage page={filter.page} limit={filter.limit} length={list.length} total={total} eventName="user-companies-click" />
          <header>
            <h3>{resource.companies}</h3>
          </header>
          <Form id="companiesForm" name="companiesForm" className="form" noValidate action={`/profiles/${user.username}/companies`}>
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
              <Sort id="sortBtn" className="col s12 m6 l4 xl3 sort" text={sortText} items={items} dropDownId="sortDropdown" />
              <Pagination className="col s12 l4 xl3" total={total} size={filter.limit} page={filter.page} search={search} />
            </section>
            {langSearch && <input type="hidden" id="lang" name="lang" value={lang} />}
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
                </p>
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
