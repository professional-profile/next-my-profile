import ArticleSaveButton from "@components/article-save-button"
import { Error } from "@components/error"
import { Pagination } from "@components/pagination"
import Search from "@components/search"
import SearchResultMessage from "@components/search-result-message"
import { Item, Sort } from "@components/sort"
import { getCurrentUser } from "@lib/account"
import { logger, toString } from "@lib/logger"
import CompanyHeader from "../../_components/header"

import { defaultLimit, getDateFormat, getLang, getLangSearch, getResource, isDefaultLang, limits, sort } from "@resources"

import { getCompanyService } from "@service/company"

import Form from "next/form"
import { headers } from "next/headers"
import Link from "next/link"

import { buildFilter, datetimeToString, formatDateTime, removeLimit, removePage, removeSort } from "web-one"

export default async function CompanyArticlesPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const headerList = await headers()
  const pathname = headerList.get("x-current-path")

  const { slug } = await params
  const query = await searchParams

  const lang = getLang(query)
  const resource = getResource(lang)

  const filter = buildFilter<any>(query, defaultLimit, ["publishedAt"])

  const service = getCompanyService()

  try {
    const account = await getCurrentUser()

    const company = await service.load(slug, account?.id)

    if (!company) {
      return <Error title={resource.error_404_title} message={resource.error_404_message} />
    }

    filter.companyId = company.id

    const { list, total } = await service.getArticles(filter, filter.limit, filter.page)

    const totalCount = total ?? 0

    const dateFormat = getDateFormat(lang)
    const langSearch = getLangSearch(lang)

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

    const sortText = filter.sort === "publishedAt" ? resource.sort_desc_time_asc : resource.sort_desc_time_desc

    const items = [sort1, sort2]

    return (
      <div className="profile">
        <CompanyHeader company={company} activeTab="articles" />

        <div className="profile-body">
          <SearchResultMessage page={filter.page} limit={filter.limit} length={list.length} total={total} eventName="company-articles-click" />

          <header>
            <h3>{resource.articles}</h3>
          </header>

          <Form id="articlesForm" name="articlesForm" className="form" noValidate action={`/companies/${company.slug}/articles`}>
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

              <Pagination className="col s12 l4 xl3" total={totalCount} size={filter.limit} page={filter.page} search={search} />
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

          {list.length === 0 ? (
            <div>{/* SearchResultMessage sẽ hiện "No data found." */}</div>
          ) : (
            <ul className="row list card-grid">
              {list.map((item: any) => (
                <li key={item.id} className="col s12 m6 l4 xl3 img-card">
                  <section>
                    <div
                      className="cover"
                      style={{
                        backgroundImage: `url('${item.thumbnail}')`,
                      }}
                    />

                    <Link href={`/news/${item.slug}${langSearch}${langSearch ? "&" : "?"}from=company&company=${company.slug}`} prefetch={false}>
                      {item.title}
                    </Link>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        width: "95%",
                        gap: "8px",
                      }}
                    >
                      <p style={{ margin: 0 }}>{formatDateTime(item.publishedAt, dateFormat)}</p>

                      <ArticleSaveButton slug={item.slug} saved={Boolean(item.savedAt)} />
                    </div>

                    <p>{item.description}</p>
                  </section>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    )
  } catch (err) {
    logger.error(`Error at ${pathname}: ${toString(err)}`)

    return <Error title={resource.error_500_title} message={resource.error_500_message} />
  }
}
