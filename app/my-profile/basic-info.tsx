"use client"

import { alertError, hideLoading, showConfirm, showLoading, toast } from "@components/ui"
import { useRouter } from "next/navigation"
import { StringMap } from "onecore"
import { useState } from "react"

export interface BasicInfoValues {
  occupation: string
  company: string
  location: string
  email: string
  phone: string
  website: string
}

interface Props {
  info: BasicInfoValues
  resource: StringMap
}

type Errors = Partial<Record<keyof BasicInfoValues, string>>

export default function BasicInfo({ info, resource }: Props) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [values, setValues] = useState<BasicInfoValues>(info)
  const [errors, setErrors] = useState<Errors>({})

  function toggle() {
    if (!editing) {
      setValues(info)
    }
    setErrors({})
    setEditing(!editing)
  }

  function change(name: keyof BasicInfoValues, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  function save() {
    showConfirm(resource.msg_confirm_save, resource.header_confirm, () => {
      showLoading()
      fetch("/api/my-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          occupation: values.occupation,
          company: values.company,
          location: values.location,
          phone: values.phone,
          website: values.website,
        }),
      })
        .then(async (res) => {
          if (res.ok) {
            toast(resource.success_save_my_profile)
            setEditing(false)
            router.refresh()
          } else if (res.status === 422) {
            const data = await res.json().catch(() => null)
            if (Array.isArray(data)) {
              const errs: Errors = {}
              data.forEach((e: { field: string; message?: string }) => {
                errs[e.field as keyof BasicInfoValues] = e.message
              })
              setErrors(errs)
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

  const Field = (name: "occupation" | "company" | "location" | "phone" | "website", label: string, type: string, maxLength?: number) => (
    <label>
      {label}
      <input
        type={type}
        id={name}
        name={name}
        value={values[name]}
        maxLength={maxLength}
        placeholder={label}
        onChange={(e) => change(name, e.target.value)}
        autoComplete="off"
      />
      {errors[name] && <span className="span-error">{errors[name]}</span>}
    </label>
  )

  return (
    <div id="userInfo" className="card">
      <header>
        <i className="material-icons highlight">account_box</i>
        {resource.user_profile_basic_info}
        <button type="button" id="basicInfoBtn" name="basicInfoBtn" className="btn-edit" onClick={toggle} aria-expanded={editing}></button>
      </header>
      {editing ? (
        <>
          <div className="form">
            {Field("occupation", resource.placeholder_occupation, "text", 100)}
            {Field("company", resource.placeholder_company, "text", 100)}
            {Field("location", resource.placeholder_location, "text", 100)}
            {Field("phone", resource.placeholder_phone, "tel")}
            {Field("website", resource.placeholder_website, "url", 255)}
          </div>
          <footer>
            <button type="button" id="cancelBasicInfoBtn" name="cancelBasicInfoBtn" className="btn-cancel" onClick={toggle}>
              {resource.cancel}
            </button>
            <button type="button" id="saveBasicInfoBtn" name="saveBasicInfoBtn" onClick={save}>
              {resource.save}
            </button>
          </footer>
        </>
      ) : (
        <>
          {info.occupation && (
            <p className="icon-text">
              <i className="material-icons">local_mall</i>
              {info.occupation}
            </p>
          )}
          {info.company && (
            <p className="icon-text">
              <i className="material-icons">location_city</i>
              {info.company}
            </p>
          )}
          {info.location && (
            <p className="icon-text">
              <i className="material-icons">location_on</i>
              {info.location}
            </p>
          )}
          {info.email && (
            <p className="icon-text">
              <i className="material-icons">email</i>
              {info.email}
            </p>
          )}
          {info.phone && (
            <p className="icon-text">
              <i className="material-icons">phone</i>
              {info.phone}
            </p>
          )}
          {info.website && (
            <p className="icon-text">
              <i className="material-icons">bookmark</i>
              <a href={info.website} title="website" target="_blank" rel="noreferrer">
                {info.website}
              </a>
            </p>
          )}
        </>
      )}
    </div>
  )
}
