import ArticleSaveButton from "@components/article-save-button"
import { Error } from "@components/error"
import { Pagination } from "@components/pagination"
import Search from "@components/search"
import SearchResultMessage from "@components/search-result-message"
import { Item, Sort } from "@components/sort"
import { logger, toString } from "@lib/logger"
import { defaultLimit, getDateFormat, getLang, getLangSearch, getResource, isDefaultLang, limits, sort } from "@resources"
import { ArticleFilter, getArticleService } from "@service/article"
import Form from "next/form"
import { headers } from "next/headers"
import Link from "next/link"
import { buildFilter, datetimeToString, formatDateTime, removeLimit, removePage, removeSort } from "web-one"

export default async function News({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams

  const lang = getLang(query)
  const resource = getResource(lang)

  const filter = buildFilter<ArticleFilter>(query, defaultLimit, ["publishedAt"])

  const service = getArticleService()

  // ==========================================
  // Số bài mỗi trang lấy trực tiếp từ ?limit=
  // Nếu không có thì dùng defaultLimit
  // ==========================================
  const pageSize = filter.limit ?? defaultLimit

  try {
    // ==========================================
    // SEARCH NEWS
    // ==========================================

    const { list, total } = await service.search(filter, pageSize, filter.page)

    console.log("NEWS RESULT:", {
      total,
      totalType: typeof total,
      listLength: list.length,
      page: filter.page,
      limit: pageSize,
      firstItem: list[0],
    })

    const dateFormat = getDateFormat(lang)
    const langSearch = getLangSearch(lang)

    // ==========================================
    // SEARCH / SORT / PAGINATION
    // ==========================================

    const search = removePage(query)
    const limitSearch = removeLimit(query)
    const sortSearch = removeSort(query)

    const prefix = sortSearch ? `?${sortSearch}&` : "?"

    const sort1: Item = {
      id: "timeDescSort",
      value: `${prefix}${sort}=-publishedAt`,
      text: resource.sort_time_desc,
    }

    const sort2: Item = {
      id: "timeAscSort",
      value: `${prefix}${sort}=publishedAt`,
      text: resource.sort_time_asc,
    }

    const items = [sort1, sort2]

    const sortText = filter.sort === "publishedAt" ? resource.sort_desc_time_asc : resource.sort_desc_time_desc

    // ==========================================
    // CURRENT PAGE
    // ==========================================

    const currentPage = filter.page ?? 1

    // ==========================================
    // RESULT RANGE
    // ==========================================

    const from = list.length > 0 ? (currentPage - 1) * pageSize + 1 : 0

    const to = list.length > 0 ? from + list.length - 1 : 0

    return (
      <div>
        <header>
          <h2>{resource.news}</h2>
        </header>

        <div className="main-body">
          {/* =====================================
              SEARCH / SORT / PAGINATION
          ====================================== */}

          <Form id="articlesForm" name="articlesForm" className="form" noValidate action="/news">
            <section className="row search-group">
              <Search
                className="col s12 m6 l4 xl6 search-input"
                limit={pageSize}
                limits={limits}
                limitSearch={limitSearch}
                id="q"
                name="q"
                defaultValue={filter.q}
                maxLength={40}
                placeholder="Search"
              />

              <Sort id="sortBtn" className="col s12 m6 l4 xl3 sort" text={sortText} items={items} dropDownId="sortDropdown" />

              <Pagination className="col s12 l4 xl3" total={total} size={pageSize} page={currentPage} search={search} />
            </section>

            {/* =====================================
                ADVANCED SEARCH
            ====================================== */}

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

          {/* =====================================
              NEWS LIST
          ====================================== */}

          <ul className="row list card-grid">
            {list.map((item, i) => (
              <li key={item.id ?? i} className="col s12 m6 l4 xl3 img-card">
                <section>
                  {/* IMAGE */}

                  <div
                    className="cover"
                    style={{
                      backgroundImage: `url('${item.thumbnail}')`,
                    }}
                  />

                  {/* TITLE */}

                  <Link href={`/news/${item.slug}${langSearch}`} prefetch={false}>
                    {item.title}
                  </Link>

                  {/* DATE + BOOKMARK */}

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

                  {/* DESCRIPTION */}

                  <p>{item.description}</p>
                </section>
              </li>
            ))}
          </ul>

          {/* =====================================
              SEARCH RESULT MESSAGE
          ====================================== */}

          <SearchResultMessage from={from} to={to} total={total} page={currentPage} size={pageSize} noData={list.length === 0} eventName="news-click" />
        </div>
      </div>
    )
  } catch (err) {
    const headerList = await headers()

    const pathname = headerList.get("x-current-path")

    logger.error(`Error at ${pathname}: ${toString(err)}`)

    return <Error title={resource.error_500_title} message={resource.error_500_message} />
  }
}
