import { getCurrentUser } from "@lib/account"
import { logger } from "@lib/logger"
import { getCompanyService } from "@service/company"
import { NextResponse } from "next/server"

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  console.log("Follow")
  const { id } = await params
  try {
    const account = await getCurrentUser()
    if (!account) {
      return NextResponse.json({ message: "Require authentication" }, { status: 401 })
    }
    const service = getCompanyService()
    const count = await service.follow(account.id, id)
    console.log("Count " + count)
    return NextResponse.json({}, { status: 200 })
  } catch (err) {
    logger.error(`Error to follow company ${id}: ${err}`)
    return NextResponse.json({}, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  console.log("Unfollow")
  const { id } = await params
  try {
    const account = await getCurrentUser()
    if (!account) {
      return NextResponse.json({ message: "Require authentication" }, { status: 401 })
    }
    const service = getCompanyService()
    await service.unfollow(account.id, id)

    return NextResponse.json({}, { status: 200 })
  } catch (err) {
    logger.error(`Error to unfollow company ${id}: ${err}`)
    return NextResponse.json({}, { status: 500 })
  }
}
