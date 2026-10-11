import { getCurrentUser } from "@lib/account"
import { logger } from "@lib/logger"
import { getRateService } from "@service/company"
import { NextRequest, NextResponse } from "next/server"
import { SubmittedRate } from "rate-service"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const account = await getCurrentUser()
    if (!account) {
      return NextResponse.json({ message: "Require authentication" }, { status: 401 })
    }
    const service = getRateService()

    const rate: SubmittedRate = await request.json()
    rate.id = id
    rate.author = account.id

    await service.rate(rate)
    return NextResponse.json({}, { status: 200 })
  } catch (err) {
    logger.error(`Error to rate company ${id}: ${err}`)
    return NextResponse.json({}, { status: 500 })
  }
}
