import { BackButton } from "@components/client"
import { Error } from "@components/error"
import SaveButton from "@components/save-button"
import { getCurrentUser } from "@lib/account"
import { logError, logger } from "@lib/logger"
import { getDateFormat, getLang, getResource } from "@resources"
import { getJobService } from "@service/job"
import { formatDateTime } from "web-one"

export default async function Job({
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

  const { slug } = await params

  const service = getJobService()
  try {
    const job = await service.load(slug)
    if (!job) {
      logger.warn(`Job not found: ${slug}`)
      return <Error title={resource.error_404_title} message={resource.error_404_message} />
    }
    const dateFormat = getDateFormat(lang)
    return (
      <article className="article">
        <header>
          <BackButton id="backBtn" name="backBtn" className="btn-back" />
          <h2>{job.title}</h2>
        </header>
        <div className="article-body">
          <h3 className="article-description">
            {resource.company}: {job.companyName}
          </h3>
          <h4 className="article-description">
            {resource.location}: {job.location}
          </h4>
          <h4 className="article-meta center-align-items">
            {formatDateTime(job.publishedAt, dateFormat)}
            {account && (
              <SaveButton
                id={job.id}
                saved={job.savedAt != null}
                api="/api/jobs"
                savedMessage={resource.job_save_success}
                unsavedMessage={resource.job_unsave_success}
                errorHeader={resource.header_error}
                errorMessage={resource.error_network}
                error401={resource.error_401}
              />
            )}
          </h4>
          <h4 className="article-meta">
            {resource.quantity}: {job.quantity}
          </h4>
          <div className="job-description" dangerouslySetInnerHTML={{ __html: job.description }}></div>
        </div>
      </article>
    )
  } catch (err) {
    logError(err)
    return <Error title={resource.error_500_title} message={resource.error_500_message} />
  }
}
