import { getCurrentUser } from "@lib/account"
import { logger } from "@lib/logger"
import { getArticleService } from "@service/article"
import { NextResponse } from "next/server"

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const account = await getCurrentUser()
    if (!account) {
      return new NextResponse("Require authentication", {
        status: 401,
        headers: { "Content-Type": "text/plain" },
      })
    }

    const service = getArticleService()
    await service.save(account.id, id)

    return NextResponse.json({}, { status: 200 })
  } catch (err) {
    logger.error(`Error to save article ${id}: ${err}`)
    return NextResponse.json({ message: "Save failed" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const account = await getCurrentUser()
    if (!account) {
      return new NextResponse("Require authentication", {
        status: 401,
        headers: { "Content-Type": "text/plain" },
      })
    }

    const service = getArticleService()
    await service.remove(account.id, id)

    return NextResponse.json({}, { status: 200 })
  } catch (err) {
    logger.error(`Error to remove article ${id}: ${err}`)
    return NextResponse.json({ message: "Remove failed" }, { status: 500 })
  }
}
