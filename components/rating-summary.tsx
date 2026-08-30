import { RateFormat } from "@service/shared/rate"
import React from "react"

type Props = {
  rate: RateFormat
}

export function RatingSummary({ rate }: Props) {
  const getWidth = (style: string) => {
    const match = style?.match(/width:\s*(\d+)%/)
    return match ? `${match[1]}%` : "0%"
  }

  const renderStar = (star?: string) => {
    if (!star) return <span className="star"></span>

    if (star.includes("partial-star")) {
      const match = star.match(/--w:\s*(\d+)%/)
      const width = match ? `${match[1]}%` : "50%"

      return <span className="star partial-star" style={{ "--w": width } as React.CSSProperties} />
    }

    if (star.includes("empty-star")) {
      return <span className="star empty-star"></span>
    }

    return <span className="star"></span>
  }

  return (
    <div className="rating-summary">
      <div className="score">
        <div id="avgValue" className="value">
          {rate.rate}
        </div>

        <div id="avgStars" className="stars">
          {renderStar(rate.star1)}
          {renderStar(rate.star2)}
          {renderStar(rate.star3)}
          {renderStar(rate.star4)}
          {renderStar(rate.star5)}
        </div>

        <div id="count" className="muted">
          {rate.count} ratings
        </div>
      </div>

      <div id="bars" className="bars">
        <div className="bar">
          <span className="bar-stars">★★★★★</span>
          <div className="track">
            <div className="fill" style={{ width: getWidth(rate.rate5) }} />
          </div>
        </div>

        <div className="bar">
          <span className="bar-stars">★★★★☆</span>
          <div className="track">
            <div className="fill" style={{ width: getWidth(rate.rate4) }} />
          </div>
        </div>

        <div className="bar">
          <span className="bar-stars">★★★☆☆</span>
          <div className="track">
            <div className="fill" style={{ width: getWidth(rate.rate3) }} />
          </div>
        </div>

        <div className="bar">
          <span className="bar-stars">★★☆☆☆</span>
          <div className="track">
            <div className="fill" style={{ width: getWidth(rate.rate2) }} />
          </div>
        </div>

        <div className="bar">
          <span className="bar-stars">★☆☆☆☆</span>
          <div className="track">
            <div className="fill" style={{ width: getWidth(rate.rate1) }} />
          </div>
        </div>
      </div>
    </div>
  )
}
