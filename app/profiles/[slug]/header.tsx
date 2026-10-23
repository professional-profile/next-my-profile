import { ClientLink } from "@components/client"
import { getResource } from "@resources"
import { User } from "@service/shared/user"
import ClientHeader from "./client-header"

type Props = {
  user: User
  lang: string
}

export default function Header({ user, lang }: Props) {
  const resource = getResource(lang)
  return (
    <>
      <div
        className="cover"
        style={{
          backgroundImage: `url(${user.coverURL || ""})`,
        }}
      />
      <ClientHeader
        id={user.id}
        avatar={user.imageURL || ""}
        name={user.displayName}
        description={user.headline}
        followed={user.followedAt != null}
        followerCount={user.followerCount ?? 0}
        api="/api/users"
        followingCount={user.followingCount || 0}
        followingText={resource.user_profile_following}
        followersText={resource.user_profile_followers}
        followText={resource.button_follow}
        unfollowText={resource.button_unfollow}
        followedMessage={resource.user_profile_follow_success}
        unfollowedMessage={resource.user_profile_unfollow_success}
        errorHeader={resource.header_error}
        errorMessage={resource.error_network}
        error401={resource.error_401}
      />
      <nav className="tabs">
        <ClientLink href={`/profiles/${user.username}`} className="tab">
          {resource.overview}
        </ClientLink>
        <ClientLink href={`/profiles/${user.username}/articles`} className="tab">
          {resource.articles}
        </ClientLink>
        <ClientLink href={`/profiles/${user.username}/followers`} className="tab">
          {resource.followers}
        </ClientLink>
        <ClientLink href={`/profiles/${user.username}/following`} className="tab">
          {resource.following}
        </ClientLink>
        <ClientLink href={`/profiles/${user.username}/companies`} className="tab">
          {resource.companies}
        </ClientLink>
      </nav>
    </>
  )
}
