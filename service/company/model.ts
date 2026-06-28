import { Attributes } from "onecore";

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