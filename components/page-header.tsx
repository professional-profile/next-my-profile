import { Account } from "@lib/account"
import { getDefaultLang, getResource } from "@resources"
import { headers } from "next/headers"
import Link from "next/link"
import { StringMap } from "onecore"
import { ButtonQ, InputQ, ToggleMenu, ToggleUniversalSearch } from "./client"
import { ToggleSidebar, ToggleTheme } from "./menu"

export interface Props {
  account?: Account | null
}

function renderMenu(resource: StringMap, account?: Account | null) {
  if (!account) {
    return null
  }
  return (
    <>
      <hr />
      <li>
        <i className="material-icons">account_circle</i>
        <Link href="/my-profile" prefetch={false}>
          {account.displayName}
        </Link>
      </li>
      <li>
        <i className="material-icons">settings</i>
        <Link href="/settings" prefetch={false}>
          {resource.settings}
        </Link>
      </li>
      <li>
        <i className="material-icons">edit</i>
        <Link href="/my-articles" prefetch={false}>
          {resource.my_articles}
        </Link>
      </li>
      <li>
        <i className="material-icons">bookmark</i>
        <Link href="/saved-news" prefetch={false}>
          {resource.saved_articles}
        </Link>
      </li>
      <li>
        <i className="material-icons">bookmark</i>
        <Link href="/saved-jobs" prefetch={false}>
          {resource.saved_jobs}
        </Link>
      </li>
      <hr />
      <li>
        <i className="material-icons">exit_to_app</i>
        <Link href="/logout" prefetch={false}>
          {resource.button_signout}
        </Link>
      </li>
    </>
  )
}
export default async function PageHeader({ account }: Props) {
  let lang: string | undefined
  if (account) {
    lang = account.language
  }
  if (!lang) {
    const defaultLang = getDefaultLang()
    const headerList = await headers()
    const language = headerList.get("x-language")
    lang = language ? language : defaultLang
  }
  const resource = getResource(lang)
  return (
    <div className="page-header">
      <form>
        <div className="search-group">
          <section>
            <ToggleMenu className="toggle-menu" />
            <ToggleUniversalSearch className="toggle-search" />
            <ToggleUniversalSearch className="close-search" />
          </section>
          <div className="logo-wrapper">
            <img className="logo" src="../logo192.png" alt="Logo of The Company" />
          </div>
          <label className="search-input">
            <InputQ id="globalQ" name="q" maxLength={80} placeholder={resource.keyword} targetClass="btn-remove-text" />
            <ButtonQ type="button" id="clearQBtn" name="clearQBtn" className="btn-remove-text" targetName="q" />
            <button type="submit" id="searchBtn" className="btn-search" />
          </label>
          <section className="quick-nav">
            <div className="dropdown-menu-profile">
              <i className="material-icons">person</i>
              <ul id="dropdown-basic" className="dropdown-content-profile">
                <ToggleSidebar
                  className="menu"
                  mode="sidebar"
                  sidebarText={resource.sidebar}
                  sidebarIcon="view_list"
                  menuText={resource.menu}
                  menuIcon="credit_card"
                />
                <hr />
                <ToggleTheme
                  theme="light"
                  darkText={resource.dark_mode}
                  darkIcon="timelapse"
                  lightText={resource.light_mode}
                  lightIcon="radio_button_checked"
                />
                {renderMenu(resource, account)}
              </ul>
            </div>
          </section>
        </div>
      </form>
    </div>
  )
}
