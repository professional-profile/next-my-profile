import { Error } from "@components/error"
import { Pagination } from "@components/pagination"
import Search from "@components/search"
import SearchResultMessage from "@components/search-result-message"
import { Item, Sort } from "@components/sort"
import { getCurrentUser } from "@lib/account"
import { logError, logger } from "@lib/logger"
import { defaultLimit, getLang, getResource, limits, sort } from "@resources"
import { getCompanyService } from "@service/company"
import Form from "next/form"
import { buildFilter, removeLimit, removePage, removeSort } from "web-one"
import CompanyHeader from "../../_components/header"

export default async function CompanyFollowersPage({
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

  const filter = buildFilter<any>(query, defaultLimit, ["followedAt"])

  const service = getCompanyService()

  try {
    const account = await getCurrentUser()

    const company = await service.load(slug, account?.id)
    if (!company) {
      logger.warn(`Company not found: ${slug}`)
      return <Error title={resource.error_404_title} message={resource.error_404_message} />
    }

    filter.companyId = company.id

    const { list, total } = await service.getFollowers(filter, filter.limit, filter.page)

    const totalCount = total ?? 0

    const search = removePage(query)
    const limitSearch = removeLimit(query)
    const sortSearch = removeSort(query)

    const prefix = sortSearch ? `?${sortSearch}&` : "?"
    const sort1: Item = { id: "timeDescSort", value: `${prefix}${sort}=-followedAt`, text: "Most Recent" }
    const sort2: Item = { id: "timeAscSort", value: `${prefix}${sort}=followedAt`, text: "Oldest" }
    const sort3: Item = { id: "nameSort", value: `${prefix}${sort}=displayName`, text: "Name" }
    const sort4: Item = { id: "nameRevertSort", value: `${prefix}${sort}=-displayName`, text: "Name Revert" }
    const items = [sort1, sort2, sort3, sort4]

    const sortText =
      filter.sort === "followedAt" ? "Oldest" : filter.sort === "displayName" ? "Name" : filter.sort === "-displayName" ? "Name Revert" : "Most Recent"

    return (
      <div className="profile">
        <CompanyHeader company={company} activeTab="followers" />
        <div className="profile-body">
          <SearchResultMessage page={filter.page} limit={filter.limit} length={list.length} total={total} eventName="company-followers-click" />
          <header>
            <h3>{resource.followers}</h3>
          </header>
          <Form id="followersForm" name="followersForm" className="form" noValidate action={`/companies/${company.slug}/followers`}>
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
              <Pagination className="col s12 l4 xl3" total={totalCount} size={filter.limit} page={filter.page} search={search} />
            </section>
          </Form>
        </div>
      </div>
    )
  } catch (err) {
    logError(err)
    return <Error title={resource.error_500_title} message={resource.error_500_message} />
  }
}
