import * as cheerio from "cheerio";
/**
 * Fetches and extracts clean text content from a given URL.
 * @param url The URL to fetch.
 * @returns The cleaned body text of the page.
 */
export async function getTextFromUrl(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }
    const html = await response.text();
    const $ = cheerio.load(html);

    // remove common noise-making to get cleaner text
    $("script, style, noscript, header, nav, aside").remove();
    const footerText = $("footer").text().replace(/\s\s+/g, " ").trim();
    const bodyText = $("body").text().replace(/\s\s+/g, " ").trim();
    return `${bodyText}\n\nFooter: ${footerText}`.replace(/\s\s+/g, " ").trim();
  } catch (error) {
    console.error("Error processing job posting from URL:", error);
    return "";
  }
}
