import { Attributes } from "onecore"

export const Published = "P"

export interface Article {
  id: string
  slug: string
  title: string
  description?: string
  publishedAt?: Date
  tags?: string[]
  thumbnail?: string
  status?: string
  createdAt?: Date
  authorId?: string
  savedAt?: Date
}

export const articleModel: Attributes = {
  id: {
    key: true,
    length: 40,
    required: true,
  },
  slug: {
    length: 120,
    required: true,
  },
  title: {
    length: 255,
    required: true,
    q: true,
  },
  description: {
    length: 1200,
    required: true,
    q: true,
  },
  publishedAt: {
    column: "published_at",
    type: "datetime",
  },
  tags: {
    type: "strings",
  },
  thumbnail: {
    length: 400,
  },
  authorId: {
    column: "author_id",
    length: 400,
    noupdate: true,
  },
  createdAt: {
    column: "created_at",
    type: "datetime",
    noupdate: true,
    createdAt: true,
  },
  savedAt: {
    column: "saved_at",
    type: "datetime",
    noupdate: true,
    noinsert: true,
  },
}
