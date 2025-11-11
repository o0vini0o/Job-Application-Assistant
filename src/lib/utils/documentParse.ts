import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

export async function extractTextFromPdf(buffer: Buffer) {
  try {
    const parse = new PDFParse(buffer);
    const data = await parse.getText();
    return data.text;
  } catch (error) {
    console.error("PDF parsing error:", error);
    throw new Error("Failed to parse PDF document");
  }
}

export async function extractTextFromWord(buffer: Buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error("Word parsing error:", error);
    throw new Error("Failed to parse Word document");
  }
}

export async function extractTextFromDocument(
  buffer: Buffer,
  mimeType: string
) {
  if (mimeType === "application/pdf") {
    return await extractTextFromPdf(buffer);
  } else if (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword"
  ) {
    return await extractTextFromWord(buffer);
  } else {
    throw new Error("Unsupported document type");
  }
}
