import { Error } from "@components/error"
import { Pagination } from "@components/pagination"
import SaveButton from "@components/save-button"
import Search from "@components/search"
import SearchResultMessage from "@components/search-result-message"
import { Item, Sort } from "@components/sort"
import { getCurrentUser } from "@lib/account"
import { logger } from "@lib/logger"
import { defaultLimit, getDateFormat, getLang, getLangSearch, getResource, limits, sort } from "@resources"
import { ArticleFilter, getArticleService, Published } from "@service/article"
import Form from "next/form"
import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import { buildFilter, datetimeToString, formatDateTime, removeLimit, removePage, removeSort } from "web-one"

export default async function SavedNews({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const headerList = await headers()
  const pathname = headerList.get("x-current-fullpath") as string
  const account = await getCurrentUser()
  if (!account) {
    redirect(`/login?redirect=${encodeURIComponent(pathname)}`)
  }

  const query = await searchParams
  const lang = getLang(query, account?.language)
  const resource = getResource(lang)

  const filter = buildFilter<ArticleFilter>(query, defaultLimit, ["publishedAt"])
  if (!filter.sort) {
    filter.sort = "-publishedAt"
  }
  filter.status = Published
  filter.userId = account?.id
  filter.isSaved = true

  const service = getArticleService()
  try {
    const { list, total } = await service.search(filter, filter.limit, filter.page)

    const dateFormat = getDateFormat(lang)
    const langSearch = getLangSearch(lang, account?.language)
    const search = removePage(query)
    const limitSearch = removeLimit(query)

    const sortSearch = removeSort(query)
    const prefix = sortSearch ? `?${sortSearch}&` : "?"
    const sort1: Item = { id: "timeDescSort", value: `${prefix}${sort}=-publishedAt`, text: resource.sort_time_desc }
    const sort2: Item = { id: "timeAscSort", value: `${prefix}${sort}=publishedAt`, text: resource.sort_time_asc }
    const items = [sort1, sort2]
    const sortText = filter.sort == "publishedAt" ? resource.sort_desc_time_asc : resource.sort_desc_time_desc

    return (
      <div>
        <header>
          <h2>{resource.news}</h2>
        </header>
        <div className="main-body">
          <Form id="articlesForm" name="articlesForm" className="form" noValidate action="/news">
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
              <Pagination className="col s12 l4 xl3" total={total} size={filter.limit} page={filter.page} search={search} />
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
            {list.map((item, i) => (
              <li key={item.id ?? i} className="col s12 m6 l4 xl3 img-card">
                <section>
                  <div className="cover" style={{ backgroundImage: `url('${item.thumbnail}')` }} />
                  <Link href={`/news/${item.slug}${langSearch}`} prefetch={false}>
                    {item.title}
                  </Link>
                  <p className="article-meta center-align-items">
                    {formatDateTime(item.publishedAt, dateFormat)}
                    <SaveButton
                      id={item.id}
                      saved={item.savedAt != null}
                      api="/api/articles"
                      savedMessage={resource.article_save_success}
                      unsavedMessage={resource.article_unsave_success}
                      errorHeader={resource.header_error}
                      errorMessage={resource.error_network}
                      error401={resource.error_401}
                    />
                  </p>
                  <p>{item.description}</p>
                </section>
              </li>
            ))}
          </ul>
          <SearchResultMessage page={filter.page} limit={filter.limit} length={list.length} total={total} eventName="news-click" />
        </div>
      </div>
    )
  } catch (err) {
    logger.error(`Error at ${pathname}: ${err}`)
    return <Error title={resource.error_500_title} message={resource.error_500_message} />
  }
}
