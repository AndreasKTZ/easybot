import { google } from "@ai-sdk/google"
import { generateText } from "ai"
import { PDFParse } from "pdf-parse"

// Exctract tekst fra PDF buffer
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) })
  const result = await parser.getText()
  return result.text
}

// Exctract tekst fra plain text filer
export function extractTextFromPlainText(buffer: Buffer): string {
  return buffer.toString("utf-8")
}

// Exctract tekst baseret på filtype
export async function extractText(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  switch (mimeType) {
    case "application/pdf":
      return extractTextFromPdf(buffer)
    case "text/plain":
      return extractTextFromPlainText(buffer)
    default:
      throw new Error(`Unsupported file type: ${mimeType}`)
  }
}

// Generér opsummering af dokument med Gemini
export async function summarizeDocument(
  text: string,
  fileName: string
): Promise<string> {
  // Begræns input for at undgå for store requests
  const maxChars = 100000
  const truncatedText = text.length > maxChars 
    ? text.slice(0, maxChars) + "\n\n[Tekst forkortet...]" 
    : text

  const { text: summary } = await generateText({
    model: google("gemini-2.5-flash-lite"),
    system: `Du er en ekspert i at opsummere dokumenter til brug i en AI-chatbot.
Din opgave er at skabe et koncist, informativt resumé som chatbotten kan bruge til at besvare spørgsmål.

Regler:
- Skriv på dansk
- Hold resuméet kort, højst 300-500 ord
- Fokusér på fakta, nøgleinformation og hovedpointer
- Inkluder vigtige tal, datoer og navne
- Strukturér resuméet logisk med bullet points hvis relevant
- Undgå redundans og fyld`,
    prompt: `Opsummér følgende dokument "${fileName}" til brug i en kundeservice-chatbot:

---
${truncatedText}
---

Giv et præcist og brugbart resumé:`,
  })

  return summary
}

// Komplet flow: Exctract tekst og generér opsummering
export async function processDocument(
  buffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<string> {
  const text = await extractText(buffer, mimeType)
  
  if (!text || text.trim().length === 0) {
    throw new Error("Could not extract text from document")
  }

  const summary = await summarizeDocument(text, fileName)
  return summary
}
