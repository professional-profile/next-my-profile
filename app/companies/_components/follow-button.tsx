"use client"

import { useState } from "react"

interface Props {
  slug: string
  followed: boolean
}

export default function CompanyFollowButton({
  slug,
  followed,
}: Props) {
  const [isFollowed, setIsFollowed] = useState(followed)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const showMessage = (text: string) => {
    setMessage(text)

    setTimeout(() => {
      setMessage("")
    }, 2000)
  }

  const handleFollow = async () => {
    if (loading) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        `/api/companies/${slug}/follow`,
        {
          method: "POST",
        }
      )

      const text = await response.text()

      console.log(
        "COMPANY FOLLOW STATUS:",
        response.status
      )

      console.log(
        "COMPANY FOLLOW RESPONSE:",
        text
      )

      if (!response.ok) {
        throw new Error(
          `Follow failed: ${response.status}`
        )
      }

      setIsFollowed(true)
      showMessage("Follow successfully")
    } catch (error) {
      console.error(
        "COMPANY FOLLOW ERROR:",
        error
      )
    } finally {
      setLoading(false)
    }
  }

  const handleUnfollow = async () => {
    if (loading) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        `/api/companies/${slug}/follow`,
        {
          method: "DELETE",
        }
      )

      const text = await response.text()

      console.log(
        "COMPANY UNFOLLOW STATUS:",
        response.status
      )

      console.log(
        "COMPANY UNFOLLOW RESPONSE:",
        text
      )

      if (!response.ok) {
        throw new Error(
          `Unfollow failed: ${response.status}`
        )
      }

      setIsFollowed(false)
      showMessage("Unfollow successfully")
    } catch (error) {
      console.error(
        "COMPANY UNFOLLOW ERROR:",
        error
      )
    } finally {
      setLoading(false)
    }
  }

  const handleClick = () => {
    if (isFollowed) {
      handleUnfollow()
    } else {
      handleFollow()
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        style={{
          border: "none",
          background: "transparent",
          padding: 0,
          marginLeft: "0px",
          cursor: loading ? "default" : "pointer",
          display: "inline-flex",
          alignItems: "center",
        }}
        aria-label={
          isFollowed
            ? "Unfollow company"
            : "Follow company"
        }
      >
        <i className="material-icons">
          {isFollowed
            ? "bookmark"
            : "bookmark_border"}
        </i>
      </button>

      {message && (
        <span
          style={{
            position: "fixed",
            left: "50%",
            bottom: "30px",
            transform: "translateX(-50%)",
            zIndex: 9999,
            minWidth: "280px",
            padding: "12px 24px",
            background: "#4d8f87",
            color: "#fff",
            textAlign: "center",
            borderRadius: "6px",
            fontWeight: 600,
          }}
        >
          {message}
        </span>
      )}
    </>
  )
}