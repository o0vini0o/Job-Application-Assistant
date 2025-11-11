import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { extractTextFromDocument } from "@/lib/utils/documentParse";
import { saveFile } from "@/lib/utils/fileStorage";

const prisma = new PrismaClient();
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const type = formData.get("type") as "CV" | "ANSCHREIBEN";
  const name = formData.get("name") as string | null;
  const tags = formData.get("tags") as string | null;

  if (!file || !type) {
    return NextResponse.json(
      { error: "File and type are required" },
      { status: 400 }
    );
  }
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const textContent = await extractTextFromDocument(buffer, file.type);

    const fileUrl = await saveFile(buffer, file.name, "base-documents");

    const parsedTags = tags ? JSON.parse(tags) : [];

    // 停用旧的同类型文档
    await prisma.baseDocument.updateMany({
      where: { type, isActive: true },
      data: { isActive: false },
    });

    // 创建新文档
    const baseDocument = await prisma.baseDocument.create({
      data: {
        name: name || file.name,
        type,
        content: textContent,
        fileUrl,
        tags: parsedTags,

        isActive: true,
      },
    });
    return NextResponse.json(
      { document: baseDocument, success: true },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
}
