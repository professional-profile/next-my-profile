"use client"

import { formatText } from "@components/format-text"
import { alertError, hideLoading, showLoading, toast } from "@components/ui"
import { useEffect, useRef, useState } from "react"

type Props = {
  id: string
  avatar: string
  name?: string
  description?: string
  followed: boolean
  api: string
  followingCount: number
  followingText: string
  followersText: string
  followText: string
  unfollowText: string
  followedMessage: string
  unfollowedMessage: string
  errorHeader: string
  errorMessage: string
  error401: string
  followerCount: number
}

export default function ClientHeader({
  id,
  avatar,
  name,
  description,
  followed,
  api,
  followingText,
  followingCount,
  followersText,
  followText,
  unfollowText,
  followedMessage,
  unfollowedMessage,
  errorHeader,
  errorMessage,
  error401,
  followerCount: fc,
}: Props) {
  const [isFollowed, setIsFollowed] = useState(followed)
  const [followerCount, setFollowerCount] = useState(fc ?? 0)

  const triggerRef = useRef<HTMLDivElement>(null)
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    const trigger = triggerRef.current
    if (!trigger) return

    const page = trigger.parentElement as HTMLDivElement

    const observer = new IntersectionObserver(
      ([entry]) => {
        setCompact(!entry.isIntersecting)
      },
      {
        root: page,
        threshold: 0,
      },
    )

    observer.observe(trigger)

    return () => observer.disconnect()
  }, [])

  const handleClick = async () => {
    showLoading()

    const method = isFollowed ? "DELETE" : "PATCH"
    try {
      const response = await fetch(`${api}/${id}`, { method })
      if (response.ok) {
        const newFollowedState = !isFollowed
        setIsFollowed(newFollowedState)
        setFollowerCount((count: number) => (newFollowedState ? Number(count) + 1 : Number(count) - 1))
        toast(newFollowedState ? followedMessage : unfollowedMessage)
      } else if (response.status === 401) {
        alertError(error401, errorHeader)
      } else {
        alertError(errorMessage, errorHeader)
      }
    } catch (err) {
      console.error(err)
      alertError(errorMessage, errorHeader)
    } finally {
      hideLoading()
    }
  }

  return (
    <>
      <div id="headerTrigger" className="header-trigger" ref={triggerRef} />
      <header id="profileHeader" className={`profile-header${compact ? " compact" : ""}`}>
        <div className="profile-header-inner">
          <div className="avatar-wrapper">
            <div
              className="avatar"
              style={{
                backgroundImage: `url(${avatar})`,
              }}
            />
          </div>
          <div className="profile-info">
            <h1>
              <span>{name}</span>
              {isFollowed && <i className="material-icons highlight">group</i>}
            </h1>
            <p>{description}</p>
            <div className="profile-followers">
              {followerCount > 0 && (
                <span>
                  <i className="material-icons highlight">group</i>
                  {formatText(followersText, followerCount)}
                </span>
              )}
              {followingCount > 0 && (
                <span>
                  <i className="material-icons highlight">group_add</i>
                  {formatText(followingText, followingCount)}
                </span>
              )}
            </div>
            <button type="button" className="btn-follow" onClick={handleClick}>
              {isFollowed ? unfollowText : followText}
            </button>
          </div>
        </div>
      </header>
    </>
  )
}
