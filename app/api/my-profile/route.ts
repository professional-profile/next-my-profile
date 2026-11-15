import { formatText } from "@components/format"
import { getCurrentUser } from "@lib/account"
import { logger } from "@lib/logger"
import { getResource, website } from "@resources"
import { getMyProfileService } from "@service/my-profile"
import { basicInfoModel, User } from "@service/my-profile/user"
import { NextRequest, NextResponse } from "next/server"
import { validate } from "validation-core"

const maxInterestLength = 100
const fields = ["occupation", "company", "location", "phone", "website"] as const

// Trims, drops empty entries, and removes case-insensitive duplicates. Returns null when the payload is not a string array.
function parseInterests(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    return null
  }
  const seen = new Set<string>()
  const interests: string[] = []
  for (const item of value as string[]) {
    const trimmed = item.trim()
    const key = trimmed.toLowerCase()
    if (trimmed.length > 0 && !seen.has(key)) {
      seen.add(key)
      interests.push(trimmed)
    }
  }
  return interests
}

export async function POST(request: NextRequest) {
  const account = await getCurrentUser()
  if (!account) {
    return NextResponse.json({ message: "Require authentication" }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 })
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ message: "Invalid body" }, { status: 400 })
  }

  // Whitelist the editable fields; the id always comes from the session.
  const info: Partial<User> = {}
  for (const field of fields) {
    const value = body[field]
    if (value === undefined || value === null) {
      continue
    }
    if (typeof value !== "string") {
      return NextResponse.json({ message: `Invalid ${field}` }, { status: 400 })
    }
    const trimmed = value.trim()
    info[field] = trimmed.length > 0 ? trimmed : (null as unknown as undefined)
  }

  let interests: string[] | undefined
  if (body.interests !== undefined && body.interests !== null) {
    const parsed = parseInterests(body.interests)
    if (!parsed) {
      return NextResponse.json({ message: "Invalid interests" }, { status: 400 })
    }
    interests = parsed
  }

  const resource = getResource(account.language)
  const errors = validate(info, basicInfoModel, resource, false, true)
  if (info.website && !website.test(info.website)) {
    errors.push({ field: "website", code: "url", message: formatText(resource.error_url, resource.user_profile_website) })
  }
  if (interests && interests.some((item) => item.length > maxInterestLength)) {
    errors.push({ field: "interests", code: "maxlength", message: formatText(resource.error_maxlength, resource.interests, maxInterestLength) })
  }
  if (errors.length > 0) {
    return NextResponse.json(errors, { status: 422 })
  }
  if (interests) {
    info.interests = interests
  }

  try {
    const res = await getMyProfileService().saveMyProfile({ ...info, id: account.id })
    return NextResponse.json(res, { status: res > 0 ? 200 : 410 })
  } catch (err) {
    logger.error(`Error at POST /api/my-profile ${account.id} ${account.username}: ${err}`)
    return NextResponse.json({}, { status: 500 })
  }
}
