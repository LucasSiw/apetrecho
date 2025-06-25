import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import { NextRequest, NextResponse } from "next/server"
import fs from "fs"

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get("file") as File

  if (!file || !file.name) {
    return NextResponse.json({ error: "Arquivo inválido" }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const filename = `${uuidv4()}-${file.name.replace(/\s+/g, "_")}`
  
  const uploadDir = path.join(process.cwd(), "public", "uploads")
  const filePath = path.join(uploadDir, filename)

  if (!fs.existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true })
  }
  await writeFile(filePath, buffer)

  const relativeUrl = `/uploads/${filename}`

  return NextResponse.json({ url: relativeUrl })
}
