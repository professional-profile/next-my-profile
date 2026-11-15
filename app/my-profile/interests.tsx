"use client"

import { alertError, hideLoading, showConfirm, showLoading, toast } from "@components/ui"
import { useRouter } from "next/navigation"
import { StringMap } from "onecore"
import { KeyboardEvent, useState } from "react"

interface Props {
  interests: string[]
  resource: StringMap
}
const maxInterestLength = 100
export default function Interests({ interests, resource }: Props) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [values, setValues] = useState<string[]>(interests)
  const [text, setText] = useState("")
  const [error, setError] = useState("")

  function toggle() {
    if (!editing) {
      setValues(interests)
    }
    setText("")
    setError("")
    setEditing(!editing)
  }

  function add() {
    const value = text.trim()
    if (value.length === 0) {
      return
    }
    const lower = value.toLowerCase()
    if (values.some((item) => item.toLowerCase() === lower)) {
      setError(resource.error_duplicated_interest)
      return
    }
    setValues((prev) => [...prev, value])
    setText("")
    setError("")
  }

  function remove(index: number) {
    setValues((prev) => prev.filter((_, i) => i !== index))
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault()
      add()
    }
  }

  function save() {
    showConfirm(resource.msg_confirm_save, resource.header_confirm, () => {
      showLoading()
      fetch("/api/my-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests: values }),
      })
        .then(async (res) => {
          if (res.ok) {
            toast(resource.success_save_my_profile)
            setEditing(false)
            router.refresh()
          } else if (res.status === 422) {
            const data = await res.json().catch(() => null)
            if (Array.isArray(data) && data.length > 0 && data[0].message) {
              setError(data[0].message)
            } else {
              alertError(resource.error_response_body, resource.header_error)
            }
          } else if (res.status === 403) {
            alertError(resource.error_403, resource.header_error)
          } else if (res.status === 410) {
            alertError(resource.error_410, resource.header_error)
          } else if (res.status === 409) {
            alertError(resource.error_409, resource.header_error)
          } else {
            alertError(resource.fail_save_my_profile, resource.header_error)
          }
        })
        .catch(() => alertError(resource.error_network, resource.header_error))
        .finally(() => hideLoading())
    })
  }

  return (
    <div id="userInterests" className="card border-bottom-highlight">
      <header>
        <i className="material-icons highlight">flash_on</i>
        {resource.interests}
        <button type="button" id="interestBtn" name="interestBtn" className="btn-edit" onClick={toggle} aria-expanded={editing}></button>
      </header>
      {editing ? (
        <>
          <section className="chip-list">
            {values.map((item, index) => (
              <div key={item} className="chip">
                {item}
                <button type="button" className="close" aria-label={`${resource.remove} ${item}`} onClick={() => remove(index)}></button>
              </div>
            ))}
          </section>
          <div className="form">
            <label>
              <div className="chip-input-container">
                <input
                  type="text"
                  id="interest"
                  name="interest"
                  value={text}
                  maxLength={maxInterestLength}
                  placeholder={resource.placeholder_user_profile_interest}
                  onChange={(e) => {
                    setText(e.target.value)
                    setError("")
                  }}
                  onKeyDown={onKeyDown}
                  autoComplete="off"
                />
                <button
                  type="button"
                  id="addInterestBtn"
                  name="addInterestBtn"
                  className="btn-add"
                  aria-label={resource.button_add_interest}
                  onClick={add}
                ></button>
              </div>
              {error && <span className="span-error">{error}</span>}
            </label>
          </div>
          <footer>
            <button type="button" id="cancelInterestBtn" name="cancelInterestBtn" className="btn-cancel" onClick={toggle}>
              {resource.cancel}
            </button>
            <button type="button" id="saveInterestBtn" name="saveInterestBtn" onClick={save}>
              {resource.save}
            </button>
          </footer>
        </>
      ) : (
        <section className="chip-list">
          {interests.map((item, index) => (
            <div key={index} className="chip" tabIndex={index}>
              {item}
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
