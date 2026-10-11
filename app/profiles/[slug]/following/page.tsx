import { Error } from "@components/error"
import FollowButton from "@components/follow-button"
import { Pagination } from "@components/pagination"
import Search from "@components/search"
import SearchResultMessage from "@components/search-result-message"
import { Item, Sort } from "@components/sort"
import { getCurrentUser } from "@lib/account"
import { logError, logger } from "@lib/logger"
import { defaultLimit, getLang, getLangSearch, getResource, limits, sort } from "@resources"
import { getUserService, UserFilter } from "@service/user"
import Form from "next/form"
import Link from "next/link"
import { buildFilter, buildSorts, getSortText, removeLimit, removePage, removeSort } from "web-one"
import Header from "../header"

export default async function FollowingPage({
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

  const filter = buildFilter<UserFilter>(query, defaultLimit, ["followedAt"])
  if (!filter.sort) {
    filter.sort = "-followedAt"
  }
  filter.userId = account?.id

  const service = getUserService()
  try {
    const { slug } = await params
    const user = await service.load(slug, account?.id)
    if (!user) {
      logger.warn(`User not found: ${slug}`)
      return <Error title={resource.error_404_title} message={resource.error_404_message} />
    }
    filter.followingUserId = user.id

    const { list, total } = await service.search(filter, filter.limit, filter.page)

    const langSearch = getLangSearch(lang)
    const search = removePage(query)
    const limitSearch = removeLimit(query)

    const sortSearch = removeSort(query)
    const prefix = sortSearch ? `?${sortSearch}&` : "?"
    const sort1: Item = { id: "followingDescSort", value: "-followingAt", text: resource.sort_time_desc, fulltext: resource.sort_desc_time_desc }
    const sort2: Item = { id: "followingAscSort", value: "followingAt", text: resource.sort_time_asc, fulltext: resource.sort_desc_time_asc }
    const sort3: Item = { id: "nameAscSort", value: "-displayName", text: resource.sort_name_asc, fulltext: resource.sort_desc_name_asc }
    const sort4: Item = { id: "nameDescSort", value: "displayName", text: resource.sort_name_desc, fulltext: resource.sort_desc_name_desc }
    const items = [sort1, sort2, sort3, sort4]
    const sortText = getSortText(items, filter.sort, resource.sort_time_desc)
    buildSorts(items, `${prefix}${sort}=`)

    return (
      <div className="profile">
        <Header user={user} lang={lang} />
        <div className="profile-body">
          <SearchResultMessage page={filter.page} limit={filter.limit} length={list.length} total={total} eventName="user-followers-click" />
          <header>
            <h3>{resource.followers}</h3>
          </header>
          <Form id="followersForm" name="followersForm" className="form" noValidate action={`/profiles/${user.username}/followers`}>
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
          <ul className="row list card-grid">
            {list.map((item, i) => {
              return (
                <li key={i} className="col s12 m6 l6 xl3 img-item">
                  <img src={item.imageURL} alt="user" className="round-border" />
                  <Link href={`/profiles/${item.username}${langSearch}`} prefetch={false}>
                    {item.displayName}
                  </Link>
                  <p className="center-align-items">
                    {item.occupation}
                    {account && account.id !== item.id && (
                      <FollowButton
                        id={item.id}
                        followed={item.followedAt != null}
                        api="/api/users"
                        followedMessage={resource.user_profile_follow_success}
                        unfollowedMessage={resource.user_profile_unfollow_success}
                        errorHeader={resource.header_error}
                        errorMessage={resource.error_network}
                        error401={resource.error_401}
                      />
                    )}
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
