import { Attributes } from "onecore"

export interface User {
  id: string
  username: string
  email?: string
  phone?: string
  dateOfBirth?: Date
  displayName?: string
  status?: string
  imageURL?: string
  coverURL?: string
  headline?: string
  bio?: string
  website?: string
  occupation?: string
  company?: string
  location?: string

  followedAt?: Date
  followerCount?: number
  followingCount?: number
}

export const userModel: Attributes = {
  id: {
    key: true,
    operator: "=",
  },
  username: {},
  email: {
    required: true,
    format: "email",
    length: 255,
  },
  phone: {
    format: "phone",
  },
  dateOfBirth: {
    column: "date_of_birth",
    type: "datetime",
  },
  displayName: {
    column: "display_name",
    length: 100,
  },
  status: {
    length: 1,
    operator: "=",
  },
  imageURL: {
    column: "image_url",
    length: 500,
  },
  coverURL: {
    column: "cover_url",
    length: 500,
  },
  headline: {
    length: 500,
  },
  bio: {
    length: 3000,
  },
  website: {
    length: 255,
  },
  occupation: {
    length: 100,
  },
  company: {
    length: 100,
  },
  location: {
    length: 100,
  },

  followingCount: {
    column: "following_count",
    type: "integer",
    noinsert: true,
    noupdate: true,
  },
  followerCount: {
    column: "follower_count",
    type: "integer",
    noinsert: true,
    noupdate: true,
  },
  followedAt: {
    column: "followed_at",
    type: "datetime",
    noinsert: true,
    noupdate: true,
  },
  userFollowedAt: {
    column: "user_followed_at",
    type: "datetime",
    noinsert: true,
    noupdate: true,
  },
}
