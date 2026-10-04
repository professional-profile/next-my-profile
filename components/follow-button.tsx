"use client"

import { useState } from "react"
import { alertError, hideLoading, showLoading, toast } from "./client-script"

interface Props {
  id: string
  followed: boolean
  api: string
  followedMessage: string
  unfollowedMessage: string
  errorHeader: string
  errorMessage: string
  error401: string
}

export default function FollowButton({ id, followed, api, followedMessage, unfollowedMessage, errorHeader, errorMessage, error401 }: Props) {
  const [isFollowed, setIsFollowed] = useState(followed)

  const handleClick = async () => {
    showLoading()

    const method = isFollowed ? "DELETE" : "PATCH"
    try {
      const response = await fetch(`${api}/${id}`, { method })

      if (response.ok) {
        const newFollowedState = !isFollowed
        setIsFollowed(newFollowedState)
        toast(newFollowedState ? followedMessage : unfollowedMessage)
      } else if (response.status === 401) {
        alertError(error401, errorHeader)
      } else {
        alertError(errorMessage, errorHeader)
      }
    } catch (error) {
      console.error(error)
    } finally {
      hideLoading()
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        style={{
          border: "none",
          background: "transparent",
          padding: 0,
          margin: 0,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: 1,
        }}
      >
        <i
          className="material-icons"
          style={{
            fontSize: "23px",
            lineHeight: 1,
          }}
        >
          {isFollowed ? "bookmark" : "bookmark_border"}
        </i>
      </button>
    </>
  )
}
