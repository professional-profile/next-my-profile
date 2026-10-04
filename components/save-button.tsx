"use client"

import { useState } from "react"
import { alertError, hideLoading, showLoading, toast } from "./client-script"

interface Props {
  id: string
  saved: boolean
  api: string
  savedMessage: string
  unsavedMessage: string
  errorHeader: string
  errorMessage: string
  error401: string
}

export default function SaveButton({ id, saved, api, savedMessage, unsavedMessage, errorHeader, errorMessage, error401 }: Props) {
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
          {isSaved ? "bookmark" : "bookmark_border"}
        </i>
      </button>
    </>
  )
}
