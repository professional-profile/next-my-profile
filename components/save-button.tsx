"use client"

import { useState } from "react"

interface Props {
  id: string
  saved: boolean
}

export default function SaveButton({ id, saved }: Props) {
  const [isSaved, setIsSaved] = useState(saved)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleClick = async () => {
    if (loading) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/articles/${id}/save`, {
        method: isSaved ? "DELETE" : "POST",
      })

      if (!response.ok) {
        throw new Error(isSaved ? "Unsave failed" : "Save failed")
      }

      const newSavedState = !isSaved

      setIsSaved(newSavedState)

      setMessage(newSavedState ? "Save article successfully" : "Unsave article successfully")

      setTimeout(() => {
        setMessage("")
      }, 2000)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        aria-label={isSaved ? "Unsave article" : "Save article"}
        style={{
          border: "none",
          background: "transparent",
          padding: 0,
          margin: 0,
          cursor: loading ? "default" : "pointer",
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
          {isSaved ? "bookmark" : "bookmark_border"}
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
            display: "block",
          }}
        >
          {message}
        </span>
      )}
    </>
  )
}
