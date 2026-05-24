import { Attributes, Transaction } from "onecore";

export interface RateSummary {
  id: string
  rate: number
  rate1: number
  rate2: number
  rate3: number
  rate4: number
  rate5: number
}

export interface RateSummaryRepository {
  exist(id: string, tx?: Transaction): Promise<boolean>
  load(id: string, tx?: Transaction): Promise<RateSummary | null>
}

export const rateHistoryModel: Attributes = {
  rate: {
    type: 'integer'
  },
  time: {
    type: 'datetime',
  },
  review: {
  },
};
export const rateModel: Attributes = {
  rateId: {
    column: "rate_id",
    key: true,
    required: true,
    operator: '='
  },
  id: {
    required: true,
    noupdate: true,
    operator: '=',
  },
  author: {
    required: true,
    noupdate: true,
    operator: '='
  },
  rate: {
    type: 'integer',
    min: 1,
    max: 5,
  },
  time: {
    type: 'datetime',
  },
  review: {
    q: true,
  },
  usefulCount: {
    column: "useful_count",
    type: 'integer',
    default: 0,
    min: 0
  },
  replyCount: {
    column: "reply_count",
    type: 'integer',
    default: 0,
    min: 0
  },
  histories: {
    type: 'array',
    typeof: rateHistoryModel
  },
  anonymous: {
    type: 'boolean',
  }
};

export const rateSummaryModel: Attributes = {
  id: {
    key: true,
  },
  rate: {
    type: 'number'
  },
  rate1: {
    type: 'number',
  },
  rate2: {
    type: 'number',
  },
  rate3: {
    type: 'number',
  },
  rate4: {
    type: 'number',
  },
  rate5: {
    type: 'number',
  },
  count: {
    type: 'number',
  },
  score: {
    type: 'number',
  }
};

export const rateReactionModel: Attributes = {
  rateId: {
    column: "rate_id",
    key: true,
    required: true
  },
  userId: {
    column: "user_id",
    key: true,
    required: true
  },
  time: {
    type: 'datetime',
  },
  reaction: {
    type: 'integer',
  }
};

export const zeroSummary: RateSummary = {
  id: "",
  rate: 0, 
  rate1: 0,
  rate2: 0,
  rate3: 0,
  rate4: 0,
  rate5: 0
}
export interface RateFormat {
  rate: string
  count: number
  rate1: string
  rate2: string
  rate3: string
  rate4: string
  rate5: string
  star1?: string
  star2?: string
  star3?: string
  star4?: string
  star5?: string
}

export function formatRate(r: RateSummary): RateFormat  {
  const rCount = r.rate1 + r.rate2 + r.rate3 + r.rate4 + r.rate5
  const score = r.rate1 + r.rate2 * 2 + r.rate3 * 3 + r.rate4 * 4 + r.rate5 * 5
  const count = rCount > 0 ? rCount : 1
  const rate = score / count
  const srate = rate.toFixed(1)
  const f: any = {
    rate: srate,
    count: rCount,
    rate1: `style="width: ${((r.rate1 * 100)/count).toFixed(0)}%"`,
    rate2: `style="width: ${((r.rate2 * 100)/count).toFixed(0)}%"`,
    rate3: `style="width: ${((r.rate3 * 100)/count).toFixed(0)}%"`,
    rate4: `style="width: ${((r.rate4 * 100)/count).toFixed(0)}%"`,
    rate5: `style="width: ${((r.rate5 * 100)/count).toFixed(0)}%"`,
  }
  for (let i = 1; i <= 5; i++) {
    const x = (rate - i + 1)*100
    f["star" + i] = x > 100 ? `class="star"` : (x <= 0 ? `class="star empty-star"` : `class="star partial-star" style="--w: ${x.toFixed(0)}%;"`)
  }
  return f
}
interface SRate {
  rate: number
}
export function calculatePercent(r: SRate): void {
  (r as any)["percent"] = `style="--percent:${(r.rate * 20).toFixed(0)}%"`
}
export function buildStarPickers(rate: number, pickers: any) {
  for (let i = 1; i <= 5; i++) {
    if (rate <= i) {
      pickers["starPicker" + i] = "active"
    } else {
      return pickers
    }
  }
  return pickers
}
