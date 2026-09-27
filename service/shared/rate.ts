import { Attributes, Transaction } from "onecore"

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
    type: "integer",
  },
  time: {
    type: "datetime",
  },
  review: {},
}
export const rateModel: Attributes = {
  rateId: {
    column: "rate_id",
    key: true,
    required: true,
    operator: "=",
  },
  id: {
    required: true,
    noupdate: true,
    operator: "=",
  },
  author: {
    required: true,
    noupdate: true,
    operator: "=",
  },
  rate: {
    type: "integer",
    min: 1,
    max: 5,
  },
  time: {
    type: "datetime",
  },
  review: {
    q: true,
  },
  usefulCount: {
    column: "useful_count",
    type: "integer",
    default: 0,
    min: 0,
  },
  replyCount: {
    column: "reply_count",
    type: "integer",
    default: 0,
    min: 0,
  },
  histories: {
    type: "array",
    typeof: rateHistoryModel,
  },
  anonymous: {
    type: "boolean",
  },
}

export const rateSummaryModel: Attributes = {
  id: {
    key: true,
  },
  rate: {
    type: "number",
  },
  rate1: {
    type: "number",
  },
  rate2: {
    type: "number",
  },
  rate3: {
    type: "number",
  },
  rate4: {
    type: "number",
  },
  rate5: {
    type: "number",
  },
  count: {
    type: "number",
  },
  score: {
    type: "number",
  },
}

export const rateReactionModel: Attributes = {
  rateId: {
    column: "rate_id",
    key: true,
    required: true,
  },
  userId: {
    column: "user_id",
    key: true,
    required: true,
  },
  time: {
    type: "datetime",
  },
  reaction: {
    type: "integer",
  },
}

export const zeroSummary: RateSummary = {
  id: "",
  rate: 0,
  rate1: 0,
  rate2: 0,
  rate3: 0,
  rate4: 0,
  rate5: 0,
}
