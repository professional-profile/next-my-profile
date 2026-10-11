import { ClientLink } from "@components/client"
import { getResource } from "@resources"
import { Company } from "@service/shared/company"
import ProfileInfo from "./profile-info"

type Props = {
  company: Company
  lang: string
}

export default function Header({ company, lang }: Props) {
  const resource = getResource(lang)
  return (
    <>
      <div
        className="cover"
        style={{
          backgroundImage: `url(${company.coverURL || ""})`,
        }}
      />
      <div id="headerTrigger" className="header-trigger" />
      <header id="profileHeader" className="profile-header">
        <div className="profile-header-inner">
          <div className="avatar-wrapper">
            <div
              className="avatar"
              style={{
                backgroundImage: `url(${company.logo || ""})`,
              }}
            />
          </div>
          <ProfileInfo
            id={company.id}
            name={company.name}
            description={company.industry}
            followed={company.followedAt != null}
            followerCount={company.followerCount ?? 0}
            api="/api/companies"
            followersText={resource.company_followers}
            followText={resource.button_follow}
            unfollowText={resource.button_unfollow}
            followedMessage={resource.company_follow_success}
            unfollowedMessage={resource.company_unfollow_success}
            errorHeader={resource.header_error}
            errorMessage={resource.error_network}
            error401={resource.error_401}
          />
        </div>
      </header>
      <nav className="tabs">
        <ClientLink href={`/companies/${company.slug}`} className="tab">
          {resource.overview}
        </ClientLink>
        <ClientLink href={`/companies/${company.slug}/reviews`} className="tab">
          {resource.reviews}
        </ClientLink>
        <ClientLink href={`/companies/${company.slug}/articles`} className="tab">
          {resource.articles}
        </ClientLink>
        <ClientLink href={`/companies/${company.slug}/followers`} className="tab">
          {resource.followers}
        </ClientLink>
        <ClientLink href={`/companies/${company.slug}/jobs`} className="tab">
          {resource.jobs}
        </ClientLink>
      </nav>
    </>
  )
}
