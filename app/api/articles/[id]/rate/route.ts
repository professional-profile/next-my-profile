import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  if (!token) {
    return NextResponse.json(
      { message: "Require Authentication" },
      { status: 401 }
    )
  }

  const body = await request.json()

  const res = await fetch(
    `http://localhost:8083/articles/${slug}/rate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }
  )

  const text = await res.text()

  return new NextResponse(text, {
    status: res.status,
    headers: {
      "Content-Type":
        res.headers.get("content-type") ?? "application/json",
    },
  })
}