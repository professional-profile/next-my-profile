"use client"

import { useState } from "react"
import { alertError, alertSuccess, alertWarning } from "./client-script"

interface Props {
  id: string
  api: string
  header: string
  reviewPlaceHolder: string
  cancelText: string
  submitText: string
  errorHeader: string
  errorMessage: string
  error401: string
  warningHeader: string
  reviewRequiredError: string
  successHeader: string
  successMessage: string
}

export default function RatingForm({
  id,
  api,
  header,
  reviewPlaceHolder,
  cancelText,
  submitText,
  errorHeader,
  errorMessage,
  error401,
  warningHeader,
  reviewRequiredError,
  successHeader,
  successMessage,
}: Props) {
  const [open, setOpen] = useState(false)
  const [rate, setRate] = useState(0)
  const [review, setReview] = useState("")

  async function submitReview() {
    if (rate === 0) {
      alertWarning(reviewRequiredError, warningHeader)
      return
    }

    try {
      const url = `${api}/${id}/rate`

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rate,
          review,
        }),
      })

      if (!res.ok) {
        if (res.status === 401) {
          alertError(error401, errorHeader)
        } else {
          alertError(errorMessage, errorHeader)
        }
        return
      }
      setOpen(false)
      setRate(0)
      setReview("")
      alertSuccess(successMessage, successHeader)
    } catch (err) {
      console.error(err)
      alertError(errorMessage, errorHeader)
    }
  }

  return (
    <>
      <div className="rate-header">
        <button type="button" className="btn-review" onClick={() => setOpen(true)}>
          {header}
        </button>
      </div>
      {open && (
        <div className="modal-bg" style={{ display: "flex" }}>
          <div className="modal">
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                await submitReview()
              }}
            >
              <h3 className="review-header">{header}</h3>
              <div className="star-picker">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span key={n} onClick={() => setRate(n)} className={n <= rate ? "active" : ""}>
                    ★
                  </span>
                ))}
              </div>
              <textarea className="review" placeholder={reviewPlaceHolder} value={review} onChange={(e) => setReview(e.target.value)} />
              <footer className="review-footer">
                <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>
                  {cancelText}
                </button>
                <button type="submit">{submitText}</button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
