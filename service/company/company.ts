import { Attributes, Filter, SearchResult } from "onecore"
import { Article } from "../shared/article"
import { Job, JobFilter } from "../shared/job"
import { User } from "../shared/user"
import { ArticleFilter } from "./article"
import { UserFilter } from "./user"

export interface Company {
  id: string
  slug: string
  name: string
  overview: string
  website?: string
  industry?: string
  size?: string
  logo?: string
  coverURL?: string
  status: string

  followerCount?: number
  followingAt?: Date
  followedAt?: Date
}
export interface CompanyFilter extends Filter {
  id?: string
  slug?: string
  name?: string
  status?: string
  userId?: string
}

export interface CompanyRepository {
  search(filter: CompanyFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<Company>>
  load(slug: string, userId?: string): Promise<Company | null>
  getIdBySlug(slug: string): Promise<string>
}
export interface CompanyService {
  search(filter: CompanyFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<Company>>
  load(slug: string, userId?: string): Promise<Company | null>
  getIdBySlug(slug: string): Promise<string>
  getArticles(filter: ArticleFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<Article>>
  getJobs(filter: JobFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<Job>>
  follow(id: string, companyId: string): Promise<number>
  unfollow(id: string, companyId: string): Promise<number>
  getFollowers(filter: UserFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<User>>
}

export const companyModel: Attributes = {
  id: {
    length: 40,
    required: true,
    key: true,
  },
  slug: {
    length: 150,
  },
  name: {
    length: 255,
    q: true,
  },
  overview: {
    length: 3000,
  },
  website: {
    length: 255,
  },
  industry: {
    length: 100,
  },
  size: {
    length: 100,
  },
  logo: {
    length: 300,
  },
  coverURL: {
    column: "cover_url",
    length: 500,
  },
  status: {
    length: 1,
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
}
