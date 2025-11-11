import OpenAI from "openai";

import { getJson } from "serpapi";
import { normalizeWebsiteUrl } from "@/lib/utils/normalizeWebsiteUrl";
import { getTextFromUrl } from "@/lib/utils/getTextFromUrl";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

/**
 * Searches for a company's official website using its name.
 * @param companyName The name of the company.
 * @returns The URL of the official website or null.
 */
async function findCompanyWebsite(companyName: string) {
  if (!process.env.SERPAPI_KEY) {
    console.warn("SERPAPI_KEY not set,Skipping company website search.");
    return null;
  }
  try {
    const response = await getJson({
      engine: "google",
      api_key: process.env.SERPAPI_KEY,
      q: `${companyName} deutschland official website `,
      num: 3,
    });

    const organicResults = response.organic_results || [];
    if (organicResults.length > 0) {
      const mainUrl = normalizeWebsiteUrl(organicResults[0].link);
      return mainUrl;
    }
    return null;
  } catch (error) {
    console.error("Error searching for company website:", error);
    return null;
  }
}

/**
 * Analyzes a company's website to extract detailed information based on the Prisma schema.
 * @param companyWebsiteUrl The URL of the company's official website.
 * @returns A structured JSON object matching the Company model.
 */
async function analyzeCompanyInfo(companyWebsiteUrl: string) {
  const baseUrl = normalizeWebsiteUrl(companyWebsiteUrl);

  const paths = [
    "",
    "/impressum",
    "/kontakt",
    "/about",
    "/uber-uns",
    "/unternehmen",
  ];

  const pageTexts: string[] = [];
  for (const p of paths) {
    const fullUrl = `${baseUrl}${p}`;
    const text = await getTextFromUrl(fullUrl);
    if (text) {
      pageTexts.push(text);
    }
  }
  if (pageTexts.length === 0) {
    console.warn(` No content extracted from ${baseUrl}`);
  }

  const combinedText = pageTexts.join("\n\n---\n\n").substring(0, 30000);
  if (!combinedText) {
    return null;
  }
  const prompt = `
 Analysiere die folgenden Webseiteninhalte und extrahiere Unternehmensdaten.
Sei gründlich und halte dich an das Schema:

Website-Inhalt:
${combinedText}

Gib das Ergebnis als JSON zurück:
{
  "name": "...",
  "website": "...",
  "linkedinUrl": "...",
  "xingUrl": "...",
  "kununuUrl": "...",
  "address": "...",
  "street": "...",
  "city": "...",
  "zipCode": "...",
  "country": "Germany",
  "industry": "...",
  "size": 0,
  "foundedYear": 0,
  "description": "..."
}`;
  try {
    const response = await openai.chat.completions.create({
      model: "gemini-2.5-pro",
      messages: [
        {
          role: "system",
          content: `
          Du bist ein präziser Unternehmensanalyst für deutsche Firmen.
          Deine Aufgabe ist es, **aus deutschen Webseiten** vollständige Unternehmensinformationen zu extrahieren.
          Anforderungen:
          - Analysiere nur **deutschsprachige Inhalte**.
          - Wenn eine Seite englisch ist, ignoriere sie.
          - Extrahiere Informationen aus Impressum, Kontakt, Über-uns oder Footer-Bereichen, falls vorhanden.
          - Gib **strukturierte, überprüfbare JSON-Daten** zurück, keine Freitexte.
          - Wenn ein Feld fehlt, gib \`null\` zurück.
            `,
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });
    const content = response.choices[0].message.content;
    if (!content) return null;

    const companyData = JSON.parse(content);
    companyData.website = companyWebsiteUrl;
    return companyData;
  } catch (error) {
    console.error("Error analyzing company info:", error);
    return null;
  }
}
type AnalyzeJobPostingInput =
  | { jobDescription: string; jobUrl?: never }
  | { jobUrl: string; jobDescription?: never };

/**
 * Analyzes a job description using OpenAI to extract structured data.
 * @param options An object containing either jobDescription or jobUrl.
 * @returns A structured JSON object with job details.
 */
export async function analyzeJobPosting(options: AnalyzeJobPostingInput) {
  let jobDescription: string;
  let jobUrl: string | undefined;

  if (options.jobUrl) {
    jobUrl = options.jobUrl;
    jobDescription = await getTextFromUrl(options.jobUrl);
    if (!jobDescription) {
      throw new Error(
        "Failed to extract job description from the provided URL."
      );
    }
  } else if (options.jobDescription) {
    jobDescription = options.jobDescription;
  } else {
    throw new Error("Either jobDescription or jobUrl must be provided.");
  }

  const prompt = `
 Analysiere folgende deutsche Stellenanzeige:
${jobDescription.substring(0, 10000)}
  Gib ein JSON-Objekt zurück mit folgender Struktur:
{
  "jobDetails": {
    "title": "...",
    "companyName": "...",
    "location": "...",
    "isRemote": true/false,
    "remoteType": "FULL_REMOTE | HYBRID | ONSITE",
    "startDate": "...",
    "salaryRange": "...",
    "languages": ["Deutsch", "Englisch", ...],
    "responsibilities": ["...", "..."],
    "requirements": ["...", "..."],
    "benefits": ["...", "..."]
  },
  "contact": {
    "name": "...",
    "email": "...",
    "phone": "...",
    "position": "..."
  }
}
Wenn etwas fehlt, gib null aus. Keine Kommentare oder Fließtext.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gemini-2.5-pro",
      messages: [
        {
          role: "system",
          content: `
          Du bist ein präziser HR-Datenanalyst, spezialisiert auf deutsche Stellenanzeigen.
Deine Aufgabe ist es, **nur die relevanten, überprüfbaren Informationen** aus der Anzeige zu extrahieren, um sie in einer Bewerbungsdatenbank zu speichern.

Richtlinien:
- Fasse Inhalte **kurz, eindeutig und faktisch** zusammen.
- **Ignoriere** Marketingtexte, doppelte Aussagen und Floskeln.
- Wenn Informationen fehlen, schreibe \`null\`.
- **Übersetze nichts**, gib alle Begriffe in der Originalsprache wieder.
- **Verändere nichts an der Bedeutung.**
- Gib **nur strukturierte JSON-Daten** aus.
          `,
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });
    const jobContent = response.choices[0].message.content || "{}";
    if (!jobContent) throw new Error("Failed to get job analysis from OpenAI");

    const { jobDetails, contact } = JSON.parse(jobContent);
    jobDetails.description = jobDescription; // ensure full description is included
    jobDetails.jobUrl = jobUrl || jobDetails.jobUrl;

    // If company name is available, try to find and analyze company website
    let companyData = null;
    if (jobDetails.companyName) {
      const companyWebsiteUrl = await findCompanyWebsite(
        jobDetails.companyName
      );
      if (companyWebsiteUrl) {
        companyData = await analyzeCompanyInfo(companyWebsiteUrl);
      }
    }
    return {
      jobApplication: jobDetails,
      company: companyData,
      contact: contact,
    };
  } catch (error) {
    console.error("Error analyzing job posting:", error);
    throw new Error("Failed to complete the analysis process.");
  }
}
