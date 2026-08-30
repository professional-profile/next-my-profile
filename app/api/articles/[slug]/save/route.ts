import { getCurrentUser } from "@lib/account"
import { getArticleService } from "@service/article"
import { NextResponse } from "next/server"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { message: "Require Authentication" },
        { status: 401 }
      )
    }

    const service = getArticleService()

    const article = await service.load(
      slug,
      user.id
    )

    if (!article) {
      return NextResponse.json(
        { message: "Article not found" },
        { status: 404 }
      )
    }

    await service.save(
      user.id,
      article.id
    )

    return NextResponse.json(
      {
        success: true,
        message: "Save successfully",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Save article error:", error)

    return NextResponse.json(
      { message: "Save failed" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { message: "Require Authentication" },
        { status: 401 }
      )
    }

    const service = getArticleService()

    const article = await service.load(
      slug,
      user.id
    )

    if (!article) {
      return NextResponse.json(
        { message: "Article not found" },
        { status: 404 }
      )
    }

    await service.remove(
      user.id,
      article.id
    )

    return NextResponse.json(
      {
        success: true,
        message: "Remove successfully",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Remove article error:", error)

    return NextResponse.json(
      { message: "Remove failed" },
      { status: 500 }
    )
  }
}