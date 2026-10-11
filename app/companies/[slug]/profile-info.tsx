"use client"

import { alertError, formatText, hideLoading, showLoading, toast } from "@components/client-script"
import { useState } from "react"

type Props = {
  id: string
  name: string
  description?: string
  followed: boolean
  api: string
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

export default function ProfileInfo({
  id,
  name,
  description,
  followed,
  api,
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
    <div className="profile-info">
      <h1>
        <span>{name}</span>
        {isFollowed && <i className="material-icons highlight">group</i>}
      </h1>
      <p>{description}</p>
      <div className="profile-followers">
        <span>
          <i className="material-icons highlight">group</i>
          {formatText(followersText, followerCount)}
        </span>
      </div>
      <button type="button" className="btn-follow" onClick={handleClick}>
        {isFollowed ? unfollowText : followText}
      </button>
    </div>
  )
}
