import { getCurrentUser } from "@lib/account"
import { logger } from "@lib/logger"
import { getMyProfileService } from "@service/my-profile"
import { UserSettings } from "@service/my-profile/user"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const account = await getCurrentUser()
  try {
    if (!account) {
      return NextResponse.json({ message: "Require authentication" }, { status: 401 })
    }
    const service = getMyProfileService()

    const settings: UserSettings = await request.json()
    await service.saveMySettings(account.id, settings)

    return NextResponse.json({}, { status: 200 })
  } catch (err) {
    logger.error(`Error to save settings ${account?.id} ${account?.username} ${account?.displayName}: ${err}`)
    return NextResponse.json({}, { status: 500 })
  }
}
