import { Error } from "@components/error"
import { Pagination } from "@components/pagination"
import Search from "@components/search"
import { logError } from "@lib/logger"
import { defaultLimit, getLang, getLangSearch, getResource, isDefaultLang, limits } from "@resources"
import { getUserService, UserFilter } from "@service/user"
import Form from "next/form"
import Link from "next/link"
import { buildFilter, removeLimit, removePage } from "web-one"

export default async function UsersForm({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams
  const lang = getLang(query)
  const resource = getResource(lang)

  const filter = buildFilter<UserFilter>(query, defaultLimit, ["publishedAt"])
  const service = getUserService()
  try {
    const { list, total } = await service.search(filter, filter.limit, filter.page)

    const langSearch = getLangSearch(lang)
    const search = removePage(query)
    const limitSearch = removeLimit(query)

    return (
      <div>
        <header>
          <h2>{resource.profiles}</h2>
        </header>
        <div className="main-body">
          <Form id="usersForm" name="usersForm" className="form" noValidate={true} action="/profiles">
            <section className="row search-group">
              <Search
                className="col s12 m6 search-input"
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
            </section>
            <section className="row search-group inline advance-search" hidden>
              <label className="col s12 m6">
                {resource.email}
                <input type="text" id="email" name="email" defaultValue={filter.email} maxLength={60} />
              </label>
            </section>
            {!isDefaultLang(lang) && <input type="hidden" id="lang" name="lang" value={lang} />}
          </Form>
          <ul className="row list card-grid">
            {list.map((item, i) => {
              return (
                <li key={i} className="col s12 m6 l6 xl3 img-item">
                  <img src={item.imageURL} alt="user" className="round-border" />
                  <Link href={`/users/${item.username}${langSearch}`} prefetch={false}>
                    {item.displayName}
                  </Link>
                  <p>
                    {item.location} {item.occupation}
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
