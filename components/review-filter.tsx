"use client"

import { Sort } from "@components/sort"

interface Props {
  resource: any
  selectedRate: string
  selectedSort?: string
}

export default function ReviewFilter({
  resource,
  selectedRate,
  selectedSort,
}: Props) {
  const sortItems = [
    {
      text: resource.sort_useful_desc,
      value: "?sort=useful_desc",
    },
    {
      text: resource.sort_time_desc,
      value: "?sort=time_desc",
    },
    {
      text: resource.sort_time_asc,
      value: "?sort=time_asc",
    },
    {
      text: resource.sort_rate_desc,
      value: "?sort=rate_desc",
    },
    {
      text: resource.sort_rate_asc,
      value: "?sort=rate_asc",
    },
  ]

  const rateItems = [
    {
      text: resource.all,
      value: "?",
    },
    {
      text: "1 ☆",
      value: "?rate=1",
    },
    {
      text: "2 ☆",
      value: "?rate=2",
    },
    {
      text: "3 ☆",
      value: "?rate=3",
    },
    {
      text: "4 ☆",
      value: "?rate=4",
    },
    {
      text: "5 ☆",
      value: "?rate=5",
    },
  ]

  const selectedSortText = `Sort by ${
    sortItems.find((item) => {
      const sortValue =
        item.value.replace("?sort=", "")

      return sortValue === selectedSort
    })?.text ?? resource.sort_useful_desc
  }`

  const handleRateClick = () => {
    window.dispatchEvent(
      new Event("review-filter-click")
    )
  }

  return (
    <section className="row search-group">
      <div className="col s12 m6 flex-direction-row">
        <Sort
          className="sort"
          parentClass="sort"
          buttonClass="btn-sort"
          text={selectedSortText}
          items={sortItems}
        />

        <div
          onClick={handleRateClick}
          style={{
            display: "inline-block",
          }}
        >
          <Sort
            className="rate"
            parentClass="rate"
            buttonClass="btn-rate"
            text={selectedRate}
            items={rateItems}
          />
        </div>
      </div>
    </section>
  )
}