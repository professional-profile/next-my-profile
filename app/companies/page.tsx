import { Error } from "@components/error"
import { Pagination } from "@components/pagination"
import Search from "@components/search"
import { Item, Sort } from "@components/sort"
import { logger, toString } from "@lib/logger"
import { defaultLimit, getDateFormat, getLang, getLangSearch, getResource, isDefaultLang, limits, sort } from "@resources"
import { CompanyFilter, getCompanyService } from "@service/company"
import Form from "next/form"
import { headers } from "next/headers"
import Link from "next/link"
import { buildFilter, removeLimit, removePage, removeSort } from "web-one"

export default async function CompaniesForm({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams
  const lang = getLang(query)
  const resource = getResource(lang)

  const filter = buildFilter<CompanyFilter>(query, defaultLimit, ["publishedAt"])
  const service = getCompanyService()
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
          <Form id="CompaniesForm" name="CompaniesForm" className="form" noValidate={true} action="/Companies">
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
              {!isDefaultLang(lang) && <input type="hidden" id="lang" name="lang" value={lang} />}
            </section>
          </Form>
          <ul className="row list card-grid">
            {list.map((item, i) => {
              return (
                <li key={i} className="col s12 l6 img-item">
                  <Link href={`/companies/${item.slug}${langSearch}`} prefetch={false}>{item.name}</Link>
                  <p>{item.industry}</p>
                </li>
              )
            })}
          </ul>
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
