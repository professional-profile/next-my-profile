import React from "react"

export interface Rate {
  rate: number
  rate1: number
  rate2: number
  rate3: number
  rate4: number
  rate5: number
}
type Props = {
  rate: Rate
}

interface RateFormat {
  rate: string
  count: number
  rate1: string
  rate2: string
  rate3: string
  rate4: string
  rate5: string
}
function formatRate(r: Rate): RateFormat {
  const rCount = r.rate1 + r.rate2 + r.rate3 + r.rate4 + r.rate5
  const score = r.rate1 + r.rate2 * 2 + r.rate3 * 3 + r.rate4 * 4 + r.rate5 * 5
  const count = rCount > 0 ? rCount : 1
  const rate = score / count
  const srate = rate.toFixed(1)
  return {
    rate: srate,
    count: rCount,
    rate1: `${((r.rate1 * 100) / count).toFixed(0)}%`,
    rate2: `${((r.rate2 * 100) / count).toFixed(0)}%`,
    rate3: `${((r.rate3 * 100) / count).toFixed(0)}%`,
    rate4: `${((r.rate4 * 100) / count).toFixed(0)}%`,
    rate5: `${((r.rate5 * 100) / count).toFixed(0)}%`,
  }
}

export function RatingSummary({ rate }: Props) {
  const r = formatRate(rate)

  const renderStar = (i: number, rate: number) => {
    if (rate > i) return <span className="star"></span>
    if (rate <= i - 1) return <span className="star empty-star"></span>
    const width = ((rate - i + 1) * 100).toFixed(0) + "%"
    return <span className="star partial-star" style={{ "--w": width } as React.CSSProperties}></span>
  }

  return (
    <div className="rating-summary">
      <div className="score">
        <div id="avgValue" className="value">
          {r.rate}
        </div>

        <div id="avgStars" className="stars">
          {renderStar(1, rate.rate)}
          {renderStar(2, rate.rate)}
          {renderStar(3, rate.rate)}
          {renderStar(4, rate.rate)}
          {renderStar(5, rate.rate)}
        </div>

        <div id="count" className="muted">
          {r.count} ratings
        </div>
      </div>

      <div id="bars" className="bars">
        <div className="bar">
          <span className="bar-stars">★★★★★</span>
          <div className="track">
            <div className="fill" style={{ width: r.rate5 }} />
          </div>
        </div>

        <div className="bar">
          <span className="bar-stars">★★★★☆</span>
          <div className="track">
            <div className="fill" style={{ width: r.rate4 }} />
          </div>
        </div>

        <div className="bar">
          <span className="bar-stars">★★★☆☆</span>
          <div className="track">
            <div className="fill" style={{ width: r.rate3 }} />
          </div>
        </div>

        <div className="bar">
          <span className="bar-stars">★★☆☆☆</span>
          <div className="track">
            <div className="fill" style={{ width: r.rate2 }} />
          </div>
        </div>

        <div className="bar">
          <span className="bar-stars">★☆☆☆☆</span>
          <div className="track">
            <div className="fill" style={{ width: r.rate1 }} />
          </div>
        </div>
      </div>
    </div>
  )
}
