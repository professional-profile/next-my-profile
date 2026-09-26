import { getCurrentUser } from "@lib/account"
import { getArticleService } from "@service/article"
import { NextResponse } from "next/server"

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: "Require Authentication" }, { status: 401 })
    }
    const { id } = await params

    const service = getArticleService()
    await service.save(user.id, id)

    return NextResponse.json(
      {
        success: true,
        message: "Save successfully",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Save article error:", error)
    return NextResponse.json({ message: "Save failed" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: "Require Authentication" }, { status: 401 })
    }

    const { id } = await params

    const service = getArticleService()
    await service.remove(user.id, id)

    return NextResponse.json(
      {
        success: true,
        message: "Remove successfully",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Remove article error:", error)
    return NextResponse.json({ message: "Remove failed" }, { status: 500 })
  }
}
