"use client"

import Link from "next/link"
import { ReactNode } from "react"

interface Props {
  href: string
  children: ReactNode
}

export default function CompanyMenuLink({
  href,
  children,
}: Props) {
  const handleClick = () => {
    if (href === "/companies") {
      window.dispatchEvent(
        new CustomEvent("companies-click")
      )
    }
  }

  return (
    <Link
      href={href}
      className="menu-item"
      prefetch={false}
      onClick={handleClick}
    >
      {children}
    </Link>
  )
}