import { SearchLink, ToggleDropdown } from "./client"

export interface Item {
  id?: string
  value: string
  text?: string
}
interface Props {
  search?: string
  field?: string
  items: Item[]
  text?: string
  id?: string
  className?: string
  dropDownId?: string
  dropdownClass?: string
  parentClass?: string
}
export function RateDropdown(props: Props) {
  const parentClass = props.parentClass ? props.parentClass : "rate"
  const dropdownClass = props.dropdownClass ? props.dropdownClass : "dropdown"
  return (
    <div className={props.className}>
      <ToggleDropdown id={props.id} className="btn-rate">
        {props.text}
      </ToggleDropdown>
      <div id={props.dropDownId} className={dropdownClass}>
        {props.items &&
          props.items.map((item, i) => {
            return (
              <SearchLink key={item.value} id={item.id} href={item.value} parentClass={parentClass}>
                {item.text}
              </SearchLink>
            )
          })}
      </div>
    </div>
  )
}
