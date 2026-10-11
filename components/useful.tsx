"use client"

import { useState } from "react"
import { alertError, hideLoading, showLoading } from "./client-script"

interface Props {
  id: string
  api: string
  description: string
  reaction: number
  usefulCount: number
  errorHeader: string
  errorMessage: string
  error401: string
}

export default function Useful({ id, api, description, reaction, usefulCount, errorHeader, errorMessage, error401 }: Props) {
  const [isUseful, setUseful] = useState(reaction > 0)
  const [count, setCount] = useState(usefulCount)

  const handleClick = async () => {
    showLoading()

    const method = isUseful ? "DELETE" : "PATCH"
    try {
      const response = await fetch(`${api}/${id}/rate`, { method })

      if (response.ok) {
        const newUsefulState = !isUseful
        setUseful(newUsefulState)
        setCount((count: number) => (newUsefulState ? Number(count) + 1 : Number(count) - 1))
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
    <footer>
      <span className="center-align-items">
        {description}
        <i className={"material-icons" + (isUseful ? " highlight" : "")} onClick={handleClick}>
          thumb_up
        </i>
      </span>
      {count > 0 && (
        <span className="center-align-items">
          <span className="useful">{count}</span>
          <i className="material-icons">thumb_up</i>
        </span>
      )}
    </footer>
  )
}
