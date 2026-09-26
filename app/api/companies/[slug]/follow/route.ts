import { getCurrentUser } from "@lib/account"
import { getCompanyService } from "@service/company"
import { NextResponse } from "next/server"

export async function POST(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params

    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: "Require Authentication" }, { status: 401 })
    }

    const service = getCompanyService()

    const company = await service.load(slug, user.id)

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 })
    }

    await service.follow(user.id, company.id)

    return NextResponse.json(
      {
        success: true,
        message: "Follow successfully",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Follow company error:", error)

    return NextResponse.json({ message: "Follow failed" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params

    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: "Require Authentication" }, { status: 401 })
    }

    const service = getCompanyService()

    const company = await service.load(slug, user.id)

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 })
    }

    await service.unfollow(user.id, company.id)

    return NextResponse.json(
      {
        success: true,
        message: "Unfollow successfully",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Unfollow company error:", error)

    return NextResponse.json({ message: "Unfollow failed" }, { status: 500 })
  }
}
