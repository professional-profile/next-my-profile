import { formatText } from "@components/format"
import { getCurrentUser } from "@lib/account"
import { logger } from "@lib/logger"
import { getResource, website } from "@resources"
import { getMyProfileService } from "@service/my-profile"
import { basicInfoModel, User } from "@service/my-profile/user"
import { NextRequest, NextResponse } from "next/server"
import { validate } from "validation-core"

const fields = ["occupation", "company", "location", "phone", "website"] as const

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

  const resource = getResource(account.language)
  const errors = validate(info, basicInfoModel, resource, false, true)
  if (info.website && !website.test(info.website)) {
    errors.push({ field: "website", code: "url", message: formatText(resource.error_url, resource.user_profile_website) })
  }
  if (errors.length > 0) {
    return NextResponse.json(errors, { status: 422 })
  }

  try {
    const res = await getMyProfileService().saveMyProfile({ ...info, id: account.id })
    return NextResponse.json(res, { status: res > 0 ? 200 : 410 })
  } catch (err) {
    logger.error(`Error at POST /api/my-profile ${account.id} ${account.username}: ${err}`)
    return NextResponse.json({}, { status: 500 })
  }
}
