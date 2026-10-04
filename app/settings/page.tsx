import { Error } from "@components/error"
import { getCurrentUser } from "@lib/account"
import { logger } from "@lib/logger"
import { getLang, getResource } from "@resources"
import { getMyProfileService } from "@service/my-profile"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export default async function SettingsForm({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const headerList = await headers()
  const pathname = headerList.get("x-current-fullpath") as string
  const account = await getCurrentUser()
  if (!account) {
    redirect(`/login?redirect=${encodeURIComponent(pathname)}`)
  }

  const query = await searchParams
  const lang = getLang(query, account?.language)
  const resource = getResource(lang)

  const service = getMyProfileService()
  try {
    const settings = await service.getMySettings(account.id)
    if (!settings) {
      logger.warn(`User settings not found: ${account.id} ${account.username}`)
      return <Error title={resource.error_404_title} message={resource.error_404_message} />
    }

    return (
      <form id="settingsForm" name="settingsForm" className="form">
        <header>
          <h2>{resource.settings}</h2>
        </header>
        <div>
          <section className="row section">
            <h4>{resource.user_settings_member_profile_preferences}</h4>
            <label className="col s12 m12 l6 switch-container">
              <input
                type="checkbox"
                id="searchEnginesLinksToMyProfile"
                name="searchEnginesLinksToMyProfile"
                defaultChecked={settings.searchEnginesLinksToMyProfile}
              />
              {resource.user_settings_search_engines_links_to_my_profile}
            </label>
            <label className="col s12 m12 l6 switch-container">
              <input
                type="checkbox"
                id="followingListPublicOnMyProfile"
                name="followingListPublicOnMyProfile"
                defaultChecked={settings.followingListPublicOnMyProfile}
              />
              {resource.user_settings_search_engines_links_to_my_profile}
            </label>
          </section>
          <section className="row section">
            <h4>{resource.user_settings_around_me_references}</h4>
            <label className="col s12 m12 l6 switch-container">
              <input
                type="checkbox"
                id="showMyProfileInSpacesAroundMe"
                name="showMyProfileInSpacesAroundMe"
                defaultChecked={settings.showMyProfileInSpacesAroundMe}
              />
              {resource.user_settings_show_my_profile_in_spaces_around_me}
            </label>
            <label className="switch-container">
              <input
                type="checkbox"
                id="showAroundMeResultsInMemberFeed"
                name="showAroundMeResultsInMemberFeed"
                defaultChecked={settings.showAroundMeResultsInMemberFeed}
              />
              {resource.user_settings_show_around_me_results_in_member_feed}
            </label>
          </section>
          <section className="row section">
            <h4>{resource.user_settings_notification_preferences}</h4>
            <label className="col s12 switch-container">
              <input type="checkbox" id="notification" name="notification" defaultChecked={settings.notification} />
              {resource.user_settings_notifications}
            </label>
            <div className="col s12 checkbox-section">
              {resource.user_settings_feed_updates}
              <div className="checkbox-group">
                <label>
                  <input type="checkbox" id="notifyFeedUpdates" name="notifyFeedUpdates" defaultChecked={settings.notifyFeedUpdates} />
                  {resource.notification}
                </label>
                <label>
                  <input type="checkbox" id="emailFeedUpdates" name="emailFeedUpdates" defaultChecked={settings.emailFeedUpdates} />
                  {resource.email}
                </label>
              </div>
            </div>
            <div className="col s12 checkbox-section">
              {resource.user_settings_post_mentions}
              <div className="checkbox-group">
                <label>
                  <input type="checkbox" id="notifyPostMentions" name="notifyPostMentions" defaultChecked={settings.notifyPostMentions} />
                  {resource.notification}
                </label>
                <label>
                  <input type="checkbox" id="emailPostMentions" name="emailPostMentions" defaultChecked={settings.emailPostMentions} />
                  {resource.email}
                </label>
              </div>
            </div>
            <div className="col s12 checkbox-section">
              {resource.user_settings_comments_of_your_posts}
              <div className="checkbox-group">
                <label>
                  <input type="checkbox" id="notifyCommentsOfYourPosts" name="notifyCommentsOfYourPosts" defaultChecked={settings.notifyCommentsOfYourPosts} />
                  {resource.notification}
                </label>
                <label>
                  <input type="checkbox" id="emailCommentsOfYourPosts" name="emailCommentsOfYourPosts" defaultChecked={settings.emailCommentsOfYourPosts} />
                  {resource.email}
                </label>
              </div>
            </div>
            <div className="col s12 checkbox-section">
              {resource.user_settings_event_invitations}
              <div className="checkbox-group">
                <label>
                  <input type="checkbox" id="notifyEventInvitations" name="notifyEventInvitations" defaultChecked={settings.notifyEventInvitations} />
                  {resource.notification}
                </label>
                <label>
                  <input type="checkbox" id="emailEventInvitations" name="emailEventInvitations" defaultChecked={settings.emailEventInvitations} />
                  {resource.email}
                </label>
              </div>
            </div>
            <div className="col s12 checkbox-section">
              {resource.user_settings_when_new_events_around}
              <div className="checkbox-group">
                <label>
                  <input type="checkbox" id="notifyWhenNewEventsAround" name="notifyWhenNewEventsAround" defaultChecked={settings.notifyWhenNewEventsAround} />
                  {resource.notification}
                </label>
                <label>
                  <input type="checkbox" id="emailWhenNewEventsAround" name="emailWhenNewEventsAround" defaultChecked={settings.emailWhenNewEventsAround} />
                  {resource.email}
                </label>
              </div>
            </div>
          </section>
        </div>
        <footer>
          <button type="submit" id="saveBtn" name="saveBtn">
            {resource.save}
          </button>
        </footer>
      </form>
    )
  } catch (err) {
    logger.error(`Error at ${pathname}: ${err}`)
    return <Error title={resource.error_500_title} message={resource.error_500_message} />
  }
}
