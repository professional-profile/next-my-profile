'use client'

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MouseEvent, ReactNode } from 'react';

export function NavClient({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname()
  const isActive = pathname === href
  return (
    <li className={isActive ? "active" : ""}>{children}</li>
  )
}

interface LinkProps {
  id?: string
  href: string
  className?: string
  prefetch?: boolean
  children?: ReactNode
  parentClass: string
}
export function SearchLink(props: LinkProps) {
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    const target = e.target as HTMLAnchorElement
    const parent = findParent(target, props.parentClass)
    if (parent) {
      parent.classList.toggle("on")
    }
  }
  return (
    <Link href={props.href} className={props.className} prefetch={props.prefetch} onClick={onClick}>
      {props.children}
    </Link>
  )
}
function findParent(e: HTMLElement | null | undefined, className: string): HTMLElement | null {
  if (!e) {
    return null
  }
  let p: HTMLElement | null = e
  while (true) {
    p = p.parentElement
    if (!p) {
      return null
    }
    if (p.classList.contains(className)) {
      return p
    }
  }
}

interface Props {
  id?: string
  name?: string
  className?: string
  children?: ReactNode
}
export default function BackButton({ id, name, className, children }: Props) {
  const router = useRouter();
  return (
    <button type="button" id={id} name={name} className={className} onClick={() => router.back()}>
      {children}
    </button>
  );
}
export function ToggleDropdown({ id, name, className, children }: Props) {
  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const target = e.target as HTMLButtonElement
    target.parentElement?.classList.toggle("on")
  }
  return (
    <button type="button" id={id} name={name} className={className} onClick={onClick}>
      {children}
    </button>
  )
}
export function ToggleMenu({ id, name, className, children }: Props) {
  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const p = findParent(e.target as HTMLElement, "sidebar-parent")
    if (p) {
      p.classList.toggle("menu-on")
    }
  }
  return (
    <button type="button" id={id} name={name} className={className} onClick={onClick}>
      {children}
    </button>
  )
}

interface SearchProps {
  id?: string
  name?: string
  className?: string
  children?: ReactNode
  targetClass?: string
}
export function ToggleSearch({ id, name, className, children, targetClass }: SearchProps) {
  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const target = e.target as HTMLButtonElement

    if (target) {
      const form = target.form
      if (form) {
        const tc = targetClass ? targetClass : ".advance-search"
        const advanceSearch = form.querySelector(tc) as HTMLElement
        if (advanceSearch) {
          const onStatus = target.classList.toggle("on")
          advanceSearch.hidden = !onStatus
        }
      }
    }
  }
  return (
    <button type="button" id={id} name={name} className={className} onClick={onClick}>
      {children}
    </button>
  )
}

export function ToggleUniversalSearch({ id, name, className, children }: Props) {
  const onClick = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault()
    const p = findParent(e.target as HTMLElement, "sidebar-parent")
    if (p) {
      p.classList.toggle("search")
    }
  }
  return (
    <button type="button" id={id} name={name} className={className} onClick={onClick}>
      {children}
    </button>
  )
}