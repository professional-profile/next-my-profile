import { BackButton } from "@components/client"
import { formatText } from "@components/client-script"
import { Error } from "@components/error"
import { Input, SubmitButton } from "@components/form"
import { getCurrentUser } from "@lib/account"
import { logger } from "@lib/logger"
import { getResource, Status } from "@resources"
import { Article, getMyArticlesService } from "@service/my-articles"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { create, datetimeToString } from "web-one"

export default async function ArticleForm({ params }: { params: Promise<{ id: string }> }) {
  const headerList = await headers()
  const pathname = headerList.get("x-current-fullpath") as string
  const account = await getCurrentUser()
  if (!account) {
    redirect(`/login?redirect=${encodeURIComponent(pathname)}`)
  }

  const { id } = await params
  const newMode = id === "new"
  const resource = getResource(account?.language)

  const service = getMyArticlesService()
  try {
    let article: Article | null = create<Article>("A")
    if (!newMode) {
      article = await service.load(id)
      if (!article) {
        logger.warn(`Article not found: ${id}`)
        return <Error title={resource.error_404_title} message={resource.error_404_message} />
      }
    }

    return (
      <form id="articleForm" name="articleForm" className="form" noValidate={true} data-required-error={resource.error_required}>
        <header>
          <BackButton id="backBtn" name="backBtn" className="btn-back" />
          <h2>{resource.my_article}</h2>
        </header>
        <div className="row">
          <label className="col s12 m6 required">
            {resource.id}
            <Input
              type="text"
              id="id"
              name="id"
              defaultValue={article.id}
              readOnly={!newMode}
              maxLength={40}
              required={true}
              requiredError={formatText(resource.error_required, resource.id)}
              placeholder={resource.id}
            />
          </label>
          <label className="col s12 m6 required">
            {resource.thumbnail}
            <Input
              type="text"
              id="thumbnail"
              name="thumbnail"
              defaultValue={article.thumbnail}
              maxLength={100}
              required={true}
              requiredError={formatText(resource.error_required, resource.thumbnail)}
              placeholder={resource.thumbnail}
            />
          </label>
          <label className="col s12 m6">
            {resource.published_at}
            <Input
              type="datetime-local"
              id="publishedAt"
              name="publishedAt"
              defaultValue={datetimeToString(article.publishedAt)}
              requiredError={formatText(resource.error_required, resource.published_at)}
              placeholder={resource.published_at}
            />
          </label>
          <label className="col s12 m6">
            {resource.status}
            <div className="radio-group">
              <label>
                <input type="radio" id="active" name="status" value={Status.Active} defaultChecked={article.status === Status.Active} />
                {resource.active}
              </label>
              <label>
                <input type="radio" id="inactive" name="status" value={Status.Inactive} defaultChecked={article.status === Status.Inactive} />
                {resource.inactive}
              </label>
            </div>
          </label>
          <label className="col s12 required">
            {resource.title}
            <Input
              type="text"
              id="title"
              name="title"
              data-type="title"
              defaultValue={article.title}
              maxLength={255}
              required={true}
              requiredError={formatText(resource.error_required, resource.title)}
              placeholder={resource.title}
            />
          </label>
          <label className="col s12 auto-height required">
            {resource.description}
            <textarea
              id="description"
              name="description"
              rows={4}
              maxLength={1200}
              placeholder={resource.description}
              defaultValue={article.description}
            ></textarea>
          </label>
          <label className="col s12 auto-height required">
            {resource.content}
            <textarea id="content" name="content" rows={40} maxLength={9600} placeholder={resource.content} defaultValue={article.content}></textarea>
          </label>
        </div>
        <footer>
          <SubmitButton
            type="submit"
            id="submitBtn"
            name="submitBtn"
            api={`/api/my-articles/${id}`}
            confirmHeader={resource.header_confirm}
            confirmMessage={resource.msg_confirm_save}
            successMessage={resource.msg_save_success}
            errorHeader={resource.header_error}
            forbiddenError={resource.error_403}
            parsingError={resource.error_response_body}
            networkError={resource.error_network}
            conflictError={resource.error_409}
            goneError={resource.error_410}
            successUrl="back"
          >
            {resource.save}
          </SubmitButton>
        </footer>
      </form>
    )
  } catch (err) {
    logger.error(`Error at ${pathname}: ${err}`)
    return <Error title={resource.error_500_title} message={resource.error_500_message} />
  }
}
