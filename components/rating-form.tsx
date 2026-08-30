"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"

interface Props {
  resource: any
}

export default function RatingForm({ resource }: Props) {
  const [open, setOpen] = useState(false)
  const [rate, setRate] = useState(0)
  const [review, setReview] = useState("")
  const [success, setSuccess] = useState(false)

  const pathname = usePathname()
  const parts = pathname.split("/").filter(Boolean)
  const slug = parts[1]

  async function submitReview() {
    if (rate === 0) {
      alert("Please choose a rating.")
      return
    }

    try {
      const url = `/api/articles/${slug}/rate`

      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rate,
          review,
        }),
      })

      if (!res.ok) {
        const text = await res.text()
        alert(`Status: ${res.status}\n\n${text}`)
        return
      }

      setOpen(false)
      setSuccess(true)

      setRate(0)
      setReview("")
    } catch (err) {
      console.error(err)
      alert("Submit review failed.")
    }
  }

  return (
    <>
      <div className="rate-header">
        <button
          type="button"
          className="btn-review"
          onClick={() => setOpen(true)}
        >
          {resource.write_a_review}
        </button>
      </div>

      {/* FORM REVIEW */}
      {open && (
        <div
          className="modal-bg"
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "rgba(0,0,0,.5)",
            zIndex: 9999,
          }}
        >
          <div
            className="modal"
            style={{
              width: "620px",
              maxWidth: "90%",
              background: "#fff",
              borderRadius: "12px",
              padding: "24px",
            }}
          >
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                await submitReview()
              }}
            >
              <h3
                style={{
                  textAlign: "center",
                  marginBottom: "20px",
                }}
              >
                {resource.write_a_review}
              </h3>

              <div
                style={{
                  textAlign: "center",
                  marginBottom: "20px",
                }}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    onClick={() => setRate(n)}
                    style={{
                      cursor: "pointer",
                      fontSize: "36px",
                      color: n <= rate ? "#f4b400" : "#d9d9d9",
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>

              <textarea
                placeholder={resource.review_placeholder}
                value={review}
                onChange={(e) => setReview(e.target.value)}
                style={{
                  width: "100%",
                  minHeight: "180px",
                  padding: "12px",
                  resize: "vertical",
                  marginBottom: "20px",
                }}
              />

              <footer
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "16px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  style={{ flex: 1 }}
                >
                  {resource.cancel}
                </button>

                <button
                  type="submit"
                  style={{ flex: 1 }}
                >
                  {resource.submit}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* SUCCESS POPUP */}
      {success && (
        <div
          onClick={() => setSuccess(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.35)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "510px",
              background: "#fff",
              borderRadius: "8px",
              overflow: "hidden",
              textAlign: "center",
              boxShadow: "0 6px 20px rgba(0,0,0,.2)",
            }}
          >
            <div
              style={{
                padding: "28px 24px 16px",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  border: "2px solid #79bcbc",
                  color: "#79bcbc",
                  margin: "0 auto 18px",
                  fontSize: "30px",
                  lineHeight: "44px",
                }}
              >
                ✓
              </div>

              <h2
                style={{
                  margin: 0,
                  color: "#444",
                  fontSize: "20px",
                  fontWeight: 700,
                }}
              >
                Success
              </h2>

              <p
                style={{
                  marginTop: "16px",
                  marginBottom: "0",
                  fontSize: "16px",
                  color: "#555",
                }}
              >
                Review is submitted successfully
              </p>
            </div>

            <div
              style={{
                borderTop: "1px solid #e5e5e5",
                padding: "14px 0",
              }}
            >
              <button
                onClick={() => setSuccess(false)}
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  border: "none",
                  background: "#7ebcbc",
                  color: "#fff",
                  fontSize: "30px",
                  cursor: "pointer",
                }}
              >
                ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}