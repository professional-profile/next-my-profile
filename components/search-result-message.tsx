"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

interface Props {
  total?: number
  page?: number
  limit: number
  length: number
  eventName?: string
}

export default function SearchResultMessage({ length = 0, total, page = 1, limit = 12, eventName }: Props) {
  if (page == null || page < 1) {
    page = 1
  }
  const from = (page - 1) * limit + 1
  const to = from + length - 1
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [visible, setVisible] = useState(false)

  const showMessage = () => {
    setVisible(false)

    setTimeout(() => {
      setVisible(true)

      setTimeout(() => {
        setVisible(false)
      }, 2000)
    }, 0)
  }

  useEffect(() => {
    const isCompanies = pathname === "/companies"

    const isNews = pathname === "/news"

    const isCompanyArticles = pathname.startsWith("/companies/") && pathname.endsWith("/articles")

    const isCompanyFollowers = pathname.startsWith("/companies/") && pathname.endsWith("/followers")

    const isArticleReview = pathname.startsWith("/news/") && pathname.endsWith("/review")

    if (!isCompanies && !isNews && !isCompanyArticles && !isCompanyFollowers && !isArticleReview) {
      setVisible(false)
      return
    }

    showMessage()
  }, [pathname, searchParams.toString(), from, to, total, page, limit])

  useEffect(() => {
    if (!eventName) {
      return
    }

    const handleEvent = () => {
      const currentPath = window.location.pathname

      const isCompanies = currentPath === "/companies"

      const isNews = currentPath === "/news"

      const isCompanyArticles = currentPath.startsWith("/companies/") && currentPath.endsWith("/articles")

      const isCompanyFollowers = currentPath.startsWith("/companies/") && currentPath.endsWith("/followers")

      const isArticleReview = currentPath.startsWith("/news/") && currentPath.endsWith("/review")

      if (isCompanies || isNews || isCompanyArticles || isCompanyFollowers || isArticleReview) {
        showMessage()
      }
    }

    window.addEventListener(eventName, handleEvent)

    return () => {
      window.removeEventListener(eventName, handleEvent)
    }
  }, [eventName])

  useEffect(() => {
    const handleReviewFilterClick = () => {
      const currentPath = window.location.pathname

      const isArticleReview = currentPath.startsWith("/news/") && currentPath.endsWith("/review")

      if (isArticleReview) {
        showMessage()
      }
    }

    window.addEventListener("review-filter-click", handleReviewFilterClick)

    return () => {
      window.removeEventListener("review-filter-click", handleReviewFilterClick)
    }
  }, [])

  if (!visible) {
    return null
  }

  let message = ""

  if (length === 0) {
    message = "No data found."
  } else if (typeof total === "number" && total > 0) {
    const totalPages = Math.ceil(total / limit)

    message = `Items ${from} to ${to} of ${total}. ` + `Page ${page} of ${totalPages}.`
  } else {
    message = `Items ${from} to ${to}.`
  }

  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        bottom: "130px",
        transform: "translateX(-50%)",
        zIndex: 9999,
        width: "calc(100% - 520px)",
        minWidth: "400px",
        padding: "6px 20px",
        background: "#4d8f87",
        color: "#fff",
        textAlign: "center",
        borderRadius: "6px",
        fontWeight: 500,
      }}
    >
      {message}
    </div>
  )
}
