import fs from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

// 确保上传目录存在
export async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

// 保存文件并返回URL
export async function saveFile(
  buffer: Buffer,
  filename: string,
  folder: string = "documents"
): Promise<string> {
  await ensureUploadDir();

  const folderPath = path.join(UPLOAD_DIR, folder);
  await fs.mkdir(folderPath, { recursive: true });

  const timestamp = Date.now();
  const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filepath = path.join(folderPath, `${timestamp}_${safeFilename}`);

  await fs.writeFile(filepath, buffer);

  // 返回相对URL
  return `/uploads/${folder}/${timestamp}_${safeFilename}`;
}

// 读取文件
export async function readFile(filepath: string): Promise<Buffer> {
  const fullPath = path.join(process.cwd(), "public", filepath);
  return await fs.readFile(fullPath);
}
