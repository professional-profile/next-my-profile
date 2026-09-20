import ArticleSaveButton from "@components/article-save-button"
import { Error } from "@components/error"
import { Pagination } from "@components/pagination"
import Search from "@components/search"
import SearchResultMessage from "@components/search-result-message"
import { Item, Sort } from "@components/sort"
import { logError } from "@lib/logger"
import { defaultLimit, getDateFormat, getLang, getLangSearch, getResource, isDefaultLang, limits, sort } from "@resources"
import { ArticleFilter, getArticleService } from "@service/article"
import Form from "next/form"
import Link from "next/link"
import { buildFilter, datetimeToString, formatDateTime, removeLimit, removePage, removeSort } from "web-one"

export default async function News({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams
  const lang = getLang(query)
  const resource = getResource(lang)
  const filter = buildFilter<ArticleFilter>(query, defaultLimit, ["publishedAt"])
  if (!filter.sort) {
    filter.sort = "-publishedAt"
  }

  const service = getArticleService()

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
            <section className="row search-group advance-search" hidden>
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
            {!isDefaultLang(lang) && <input type="hidden" id="lang" name="lang" value={lang} />}
          </Form>

          <ul className="row list card-grid">
            {list.map((item, i) => (
              <li key={item.id ?? i} className="col s12 m6 l4 xl3 img-card">
                <section>
                  <div
                    className="cover"
                    style={{
                      backgroundImage: `url('${item.thumbnail}')`,
                    }}
                  />
                  <Link href={`/news/${item.slug}${langSearch}`} prefetch={false}>
                    {item.title}
                  </Link>
                  <p
                    style={{
                      textAlign: "left",
                    }}
                  >
                    <span>{formatDateTime(item.publishedAt, dateFormat)}</span>
                    <span
                      style={{
                        display: "inline-flex",
                        marginLeft: "8px",
                        verticalAlign: "middle",
                        position: "relative",
                        top: "3px",
                      }}
                    >
                      <ArticleSaveButton slug={item.slug} saved={!!item.savedAt} />
                    </span>
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
    logError(err)
    return <Error title={resource.error_500_title} message={resource.error_500_message} />
  }
}
