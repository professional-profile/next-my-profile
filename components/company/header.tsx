"use client"

import Link from "next/link"
import { useState } from "react"

type Props = {
  company: any
  activeTab?:
    | "overview"
    | "reviews"
    | "articles"
    | "followers"
    | "jobs"
}

export default function CompanyHeader({
  company,
  activeTab = "overview",
}: Props) {
  const [following, setFollowing] = useState(
    Boolean(
      company.followingAt ||
      company.followedAt
    )
  )

  const [followerCount, setFollowerCount] =
    useState(
      company.followerCount ?? 0
    )

  const [message, setMessage] = useState("")

  const [loading, setLoading] =
    useState(false)

  const handleFollow = async () => {
    if (loading) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        `/api/companies/${company.slug}/follow`,
        {
          method: "POST",
        }
      )

      const text = await response.text()

      console.log(
        "FOLLOW STATUS:",
        response.status
      )

      console.log(
        "FOLLOW RESPONSE:",
        text
      )

      if (!response.ok) {
        throw new Error(
          `Follow failed: ${response.status}`
        )
      }

      setFollowing(true)

      setFollowerCount(
        (count: number) => count + 1
      )

      setMessage(
        "Follow successfully"
      )

      setTimeout(() => {
        setMessage("")
      }, 2000)
    } catch (error) {
      console.error(
        "FOLLOW ERROR:",
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
        `/api/companies/${company.slug}/follow`,
        {
          method: "DELETE",
        }
      )

      const text = await response.text()

      console.log(
        "UNFOLLOW STATUS:",
        response.status
      )

      console.log(
        "UNFOLLOW RESPONSE:",
        text
      )

      if (!response.ok) {
        throw new Error(
          `Unfollow failed: ${response.status}`
        )
      }

      setFollowing(false)

      setFollowerCount(
        (count: number) =>
          Math.max(0, count - 1)
      )

      setMessage(
        "Unfollow successfully"
      )

      setTimeout(() => {
        setMessage("")
      }, 2000)
    } catch (error) {
      console.error(
        "UNFOLLOW ERROR:",
        error
      )
    } finally {
      setLoading(false)
    }
  }

  const handleFollowToggle = () => {
    if (following) {
      handleUnfollow()
    } else {
      handleFollow()
    }
  }

  const handleArticlesClick = () => {
    window.dispatchEvent(
      new Event(
        "company-articles-click"
      )
    )
  }

  const handleFollowersClick = () => {
    window.dispatchEvent(
      new Event(
        "company-followers-click"
      )
    )
  }

  return (
    <>
      {/* Cover */}
      <div
        className="cover"
        style={{
          backgroundImage: `url(${
            company.coverURL || ""
          })`,
        }}
      />

      <div
        id="headerTrigger"
        className="header-trigger"
      />

      {/* Header */}
      <header
        id="profileHeader"
        className="profile-header"
      >
        <div className="profile-header-inner">
          <div className="avatar-wrapper">
            <div
              className="avatar"
              style={{
                backgroundImage: `url(${
                  company.logo || ""
                })`,
              }}
            />
          </div>

          <div className="profile-info">
            <h1>
              <span>
                {company.name}
              </span>

              {following && (
                <i className="material-icons highlight">
                  group
                </i>
              )}
            </h1>

            <p>
              {company.industry}
            </p>

            <div className="profile-followers">
              <span>
                <i className="material-icons highlight">
                  group
                </i>
                {followerCount} followers
              </span>
            </div>

            {company.website && (
              <p>
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {company.website}
                </a>
              </p>
            )}

            <button
              type="button"
              className="btn-follow"
              onClick={
                handleFollowToggle
              }
              disabled={loading}
            >
              {following
                ? "Unfollow"
                : "Follow"}
            </button>
          </div>
        </div>
      </header>

      {/* Success message */}
      {message && (
        <div
          style={{
            position: "fixed",
            left: "50%",
            bottom: "30px",
            transform:
              "translateX(-50%)",
            zIndex: 9999,
            minWidth: "280px",
            padding:
              "12px 24px",
            background: "#4d8f87",
            color: "#fff",
            textAlign: "center",
            borderRadius: "6px",
            fontWeight: 600,
          }}
        >
          {message}
        </div>
      )}

      {/* Tabs */}
      <nav className="tabs">
        <Link
          href={`/companies/${company.slug}`}
          className={`tab ${
            activeTab === "overview"
              ? "active"
              : ""
          }`}
        >
          Overview
        </Link>

        <Link
          href={`/companies/${company.slug}/reviews`}
          className={`tab ${
            activeTab === "reviews"
              ? "active"
              : ""
          }`}
        >
          Reviews
        </Link>

        <Link
          href={`/companies/${company.slug}/articles`}
          className={`tab ${
            activeTab === "articles"
              ? "active"
              : ""
          }`}
          onClick={
            handleArticlesClick
          }
        >
          Articles
        </Link>

        <Link
          href={`/companies/${company.slug}/followers`}
          className={`tab ${
            activeTab === "followers"
              ? "active"
              : ""
          }`}
          onClick={
            handleFollowersClick
          }
        >
          Followers
        </Link>

        <Link
          href={`/companies/${company.slug}/jobs`}
          className={`tab ${
            activeTab === "jobs"
              ? "active"
              : ""
          }`}
        >
          Jobs
        </Link>
      </nav>
    </>
  )
}