import Link from "next/link"

type Props = {
  company: any
  articles: any[]
}

export default function CompanyArticles({
  company,
  articles,
}: Props) {
  return (
    <>
      <header>
        <h3>Articles</h3>
      </header>

      <ul className="row list card-grid">
        {articles.map((item) => (
          <li
            key={item.id}
            className="col s12 m6 l4 xl3 img-card"
          >
            <section>
              <div
                className="cover"
                style={{
                  backgroundImage: `url(${item.thumbnail || ""})`,
                }}
              />

              <Link href={`/news/${item.slug}`}>
                {item.title}
              </Link>

              <p className="article-meta center-align-items">
                {item.publishedAt
                  ? new Date(
                      item.publishedAt
                    ).toLocaleDateString()
                  : ""}

                <i className="material-icons">
                  {item.savedAt
                    ? "bookmark"
                    : "bookmark_border"}
                </i>
              </p>

              <p>{item.description}</p>
            </section>
          </li>
        ))}
      </ul>
    </>
  )
}