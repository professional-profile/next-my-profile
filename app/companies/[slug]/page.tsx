import { Error } from "@components/error"
import { getCurrentUser } from "@lib/account"
import { logError, logger } from "@lib/logger"
import { getLang, getResource } from "@resources"
import { getCompanyService } from "@service/company"
import Header from "./header"

export default async function CompanyPage({
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

  const service = getCompanyService()
  try {
    const { slug } = await params
    const company = await service.load(slug, account?.id)
    if (!company) {
      logger.warn(`Company not found: ${slug}`)
      return <Error title={resource.error_404_title} message={resource.error_404_message} />
    }

    return (
      <div className="profile">
        <Header company={company} lang={lang} />
        <div className="profile-body">
          <form id="companyForm" name="companyForm">
            <div className="row list card-grid">
              <div className="col m12 l4">
                <div className="card">
                  <header>
                    <i className="material-icons highlight">local_mall</i>
                    {resource.company_basic_info}
                  </header>
                  {company.industry && (
                    <p className="icon-text">
                      <i className="material-icons">location_city</i>
                      {company.industry}
                    </p>
                  )}
                  {company.size && (
                    <p className="icon-text">
                      <i className="material-icons">local_mall</i>
                      {company.size}
                    </p>
                  )}
                </div>
                <div className="card">
                  <header>
                    <i className="material-icons highlight">email</i>
                    {resource.company_contact_info}
                  </header>
                  {company.website && (
                    <p className="icon-text">
                      <i className="material-icons">public</i>
                      <a href={company.website} title="website" target="_blank" rel="noreferrer">
                        {company.website}
                      </a>
                    </p>
                  )}
                  <p className="icon-text">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 15.3 15.4"
                      role="img"
                      aria-labelledby="aeaiy4p0y15j8vy4fq2tp21o9gluhm1g"
                      className="octicon"
                      width="18"
                      height="18"
                    >
                      <title id="aeaiy4p0y15j8vy4fq2tp21o9gluhm1g">Facebook</title>
                      <path
                        d="M14.5 0H.8a.88.88 0 0 0-.8.9v13.6a.88.88 0 0 0 .8.9h7.3v-6h-2V7.1h2V5.4a2.87 2.87 0 0 1 2.5-3.1h.5a10.87 10.87 0 0 1 1.8.1v2.1h-1.3c-1 0-1.1.5-1.1 1.1v1.5h2.3l-.3 2.3h-2v5.9h3.9a.88.88 0 0 0 .9-.8V.8a.86.86 0 0 0-.8-.8z"
                        fill="currentColor"
                      ></path>
                    </svg>
                    <a href="https://facebook.com/minhduc1405" title="facebook" target="_blank" rel="noreferrer">
                      minhduc1405
                    </a>
                  </p>
                  <p className="icon-text">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 16 16"
                      fill="none"
                      role="img"
                      aria-labelledby="acebck4n0ndpuwfypjm9vui6fy7auzbz"
                      className="octicon"
                    >
                      <title id="acebck4n0ndpuwfypjm9vui6fy7auzbz">LinkedIn</title>
                      <g clipPath="url(#clip0_202_91845)">
                        <path
                          d="M14.5455 0H1.45455C0.650909 0 0 0.650909 0 1.45455V14.5455C0 15.3491 0.650909 16 1.45455 16H14.5455C15.3491 16 16 15.3491 16 14.5455V1.45455C16 0.650909 15.3491 0 14.5455 0ZM5.05746 13.0909H2.912V6.18764H5.05746V13.0909ZM3.96291 5.20073C3.27127 5.20073 2.712 4.64 2.712 3.94982C2.712 3.25964 3.272 2.69964 3.96291 2.69964C4.65236 2.69964 5.21309 3.26036 5.21309 3.94982C5.21309 4.64 4.65236 5.20073 3.96291 5.20073ZM13.0938 13.0909H10.9498V9.73382C10.9498 8.93309 10.9353 7.90327 9.83491 7.90327C8.71855 7.90327 8.54691 8.77527 8.54691 9.67564V13.0909H6.40291V6.18764H8.46109V7.13091H8.49018C8.77673 6.58836 9.47636 6.016 10.52 6.016C12.6924 6.016 13.0938 7.44582 13.0938 9.30473V13.0909V13.0909Z"
                          fill="currentColor"
                        ></path>
                      </g>
                    </svg>
                    <a href="https://www.linkedin.com/in/duc-nguyen-437240239/" title="Linked in" target="_blank" rel="noreferrer">
                      duc-nguyen-437240239
                    </a>
                  </p>
                  <p className="icon-text">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 16 16"
                      width="16"
                      height="16"
                      role="img"
                      aria-labelledby="ao03sn9p5pr8jedn0s5ax9eggkuvp7cn"
                      className="octicon"
                    >
                      <title id="ao03sn9p5pr8jedn0s5ax9eggkuvp7cn">X</title>
                      <path
                        fill="currentColor"
                        d="M9.332 6.925 14.544 1h-1.235L8.783 6.145 5.17 1H1l5.466 7.78L1 14.993h1.235l4.78-5.433 3.816 5.433H15L9.332 6.925ZM7.64 8.848l-.554-.775L2.68 1.91h1.897l3.556 4.975.554.775 4.622 6.466h-1.897L7.64 8.848Z"
                      ></path>
                    </svg>
                    <a href="https://x.com/minhduc1405" title="X" target="_blank" rel="noreferrer">
                      minhduc1405
                    </a>
                  </p>
                </div>
              </div>
              <div className="col m12 l8">
                <div className="card border-bottom-highlight">
                  <header>
                    <i className="material-icons highlight">location_city</i>
                    {resource.company_overview}
                  </header>
                  <div className="card-body">{company.overview}</div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    )
  } catch (err) {
    logError(err)
    return <Error title={resource.error_500_title} message={resource.error_500_message} />
  }
}
