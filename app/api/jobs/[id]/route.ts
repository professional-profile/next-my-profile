import { getCurrentUser } from "@lib/account"
import { logger } from "@lib/logger"
import { getJobService } from "@service/job"
import { NextResponse } from "next/server"

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const account = await getCurrentUser()
    if (!account) {
      return NextResponse.json({ message: "Require authentication" }, { status: 401 })
    }

    const service = getJobService()
    await service.save(account.id, id)

    return NextResponse.json({}, { status: 200 })
  } catch (err) {
    logger.error(`Error to save job ${id}: ${err}`)
    return NextResponse.json({}, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const account = await getCurrentUser()
    if (!account) {
      return NextResponse.json({ message: "Require authentication" }, { status: 401 })
    }

    const service = getJobService()
    await service.remove(account.id, id)

    return NextResponse.json({}, { status: 200 })
  } catch (err) {
    logger.error(`Error to remove job ${id}: ${err}`)
    return NextResponse.json({ message: "Remove failed" }, { status: 500 })
  }
}
