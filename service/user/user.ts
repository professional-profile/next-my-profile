import { Attributes, DateRange, Filter, SearchResult, TimeRange } from "onecore"
import { Article } from "../shared/article"
import { Company } from "../shared/company"

export interface User {
  id: string
  username: string
  email?: string
  phone?: string
  dateOfBirth?: Date
  displayName?: string
  givenName?: string
  familyName?: string
  middleName?: string
  status?: string
  //image?: UploadSize[]
  imageURL?: string
  coverURL?: string
  headline?: string
  bio?: string
  website?: string
  occupation?: string
  company?: string
  location?: string
  interests: string[]
  skills: Skill[]
  achievements: Achievement[]
  works: Work[]
  educations: Education[]
  settings?: UserSettings

  followingCount?: number
  followerCount?: number
  followedAt?: Date
}
export interface UserSettings {
  language: string
  dateFormat: string
  dateTimeFormat: string
  timeFormat: string
  notification: boolean
}
export interface Skill {
  skill: string
  hirable: boolean
}
export interface Achievement {
  subject: string
  description: string
}
export interface Work {
  name: string
  position: string
  description: string
  item: string[]
  from: string
  to: string
} // End of Work
export interface Education {
  school: string
  degree: string
  major: string
  title: string
  from: string
  to: string
} // Education

export interface UserFilter extends Filter {
  id?: string
  username?: string
  email?: string
  phone?: string
  dateOfBirth?: DateRange
  interests?: string[]
  skills?: Skill[]
  userId?: string
  followedUserId?: string
  followingUserId?: string
}
export interface ArticleFilter extends Filter {
  status?: string
  publishedAt: TimeRange
  tags?: string[]
  authorId?: string

  userId?: string
}
export interface CompanyFilter extends Filter {
  userId?: string
  currentUserId?: string
  status?: string
}

export interface UserService {
  search(filter: UserFilter, limit: number, page?: number | string, fields?: string[]): Promise<SearchResult<User>>
  load(slug: string, userId?: string): Promise<User | null>
  getIdBySlug(slug: string): Promise<string>
  follow(id: string, target: string): Promise<number>
  unfollow(id: string, target: string): Promise<number>
  getArticles(filter: ArticleFilter, limit: number, page?: number | string, fields?: string[]): Promise<SearchResult<Article>>
  getCompanies(filter: CompanyFilter, limit: number, page?: number | string, fields?: string[]): Promise<SearchResult<Company>>
}

export interface UserRepository {
  search(filter: UserFilter, limit: number, page?: number | string, fields?: string[]): Promise<SearchResult<User>>
  load(slug: string, userId?: string): Promise<User | null>
  getIdBySlug(slug: string): Promise<string>
}
export interface ArticleRepository {
  search(filter: ArticleFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<Article>>
}
export interface CompanyRepository {
  search(filter: CompanyFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<Company>>
}

export const skillsModel: Attributes = {
  skill: {
    required: true,
  },
  hirable: {
    type: "boolean",
  },
}
export const achievementsModel: Attributes = {
  description: {},
  highlight: {
    type: "boolean",
  },
  subject: {},
}
export const educationsModel: Attributes = {
  from: {
    type: "string",
  },
  to: {
    type: "boolean",
  },
  major: {
    type: "string",
  },
  title: {
    type: "string",
  },
  degree: {
    type: "string",
  },
  school: {
    type: "string",
  },
}
export const userSettingsModel: Attributes = {
  userId: {},
  language: {},
  dateFormat: {},
  dateTimeFormat: {},
  timeFormat: {},
  notification: {
    type: "boolean",
  },
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
  givenName: {
    column: "given_name",
    length: 100,
  },
  familyName: {
    column: "family_name",
    length: 100,
  },
  middleName: {
    column: "middle_name",
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
  interests: {
    type: "strings",
  },
  skills: {
    type: "array",
    typeof: skillsModel,
  },
  achievements: {
    type: "array",
    typeof: achievementsModel,
  },
  educations: {
    type: "array",
    typeof: educationsModel,
  },
  settings: {
    type: "object",
    typeof: userSettingsModel,
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
  followingAt: {
    column: "following_at",
    type: "datetime",
    noinsert: true,
    noupdate: true,
  },
}
