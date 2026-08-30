"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

interface Props {
  from: number
  to: number
  total?: number
  page?: number
  size?: number
  noData?: boolean
  eventName?: string
}

export default function SearchResultMessage({ from, to, total, page = 1, size = 12, noData = false, eventName }: Props) {
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
  }, [pathname, searchParams.toString(), from, to, total, page, size, noData])

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

  if (noData) {
    message = "No data found."
  } else if (typeof total === "number" && total > 0) {
    const totalPages = Math.ceil(total / size)

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
