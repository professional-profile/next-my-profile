"use client"

import { useState } from "react"
import { alertError, hideLoading, showLoading, toast } from "./client-script"

interface Props {
  id: string
  saved: boolean
  api: string
  savedMessage: string
  unsavedMessage: string
  errorMessage: string
  errorHeader: string
}

export default function SaveButton({ id, saved, api, savedMessage, unsavedMessage, errorMessage, errorHeader }: Props) {
  const [isSaved, setIsSaved] = useState(saved)

  const handleClick = async () => {
    showLoading()

    const method = isSaved ? "DELETE" : "PATCH"
    try {
      const response = await fetch(`${api}/${id}`, { method })

      if (response.ok) {
        const newSavedState = !isSaved
        setIsSaved(newSavedState)
        toast(newSavedState ? savedMessage : unsavedMessage)
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
        aria-label={isSaved ? "Unsave article" : "Save article"}
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
          {isSaved ? "bookmark" : "bookmark_border"}
        </i>
      </button>
    </>
  )
}
