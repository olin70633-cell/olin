import { Router, type IRouter } from "express";
import { GetKoreanNewsResponse } from "@workspace/api-zod";

const router: IRouter = Router();
type KoreanNewsStory = {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  url: string;
};

const feedUrl =
  "https://news.google.com/rss/search?q=%EC%9D%B8%EA%B3%B5%EC%A7%80%EB%8A%A5+OR+%EB%B0%98%EB%8F%84%EC%B2%B4+OR+IT&hl=ko&gl=KR&ceid=KR%3Ako";

function decodeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#x([0-9a-f]+);/gi, (_match, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replace(/&#(\d+);/g, (_match, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 10)),
    )
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .trim();
}

function readTag(xml: string, tag: string): string {
  const match = xml.match(
    new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"),
  );
  return match ? decodeXml(match[1]) : "";
}

function parseKoreanStories(xml: string): KoreanNewsStory[] {
  const items = xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi);
  const stories: KoreanNewsStory[] = [];

  for (const [, item] of items) {
    const rawTitle = readTag(item, "title");
    const source = readTag(item, "source");
    const title = source && rawTitle.endsWith(` - ${source}`)
      ? rawTitle.slice(0, -(source.length + 3)).trim()
      : rawTitle;
    const url = readTag(item, "link");
    const publishedAt = new Date(readTag(item, "pubDate"));
    const id = readTag(item, "guid") || url;

    if (
      !title ||
      !/[가-힣]/u.test(title) ||
      !url ||
      Number.isNaN(publishedAt.getTime())
    ) {
      continue;
    }

    stories.push({
      id,
      title,
      source: source && /[가-힣]/u.test(source) ? source : "언론사",
      publishedAt: publishedAt.toISOString(),
      url,
    });

    if (stories.length === 5) break;
  }

  return stories;
}

router.get("/news/korean", async (req, res): Promise<void> => {
  try {
    const response = await fetch(feedUrl, {
      headers: { accept: "application/rss+xml, application/xml, text/xml" },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      req.log.warn({ status: response.status }, "Korean news feed request failed");
      res.status(502).json({ error: "Korean news is temporarily unavailable." });
      return;
    }

    const stories = parseKoreanStories(await response.text());
    res.json(GetKoreanNewsResponse.parse({ stories }));
  } catch (error) {
    req.log.warn({ err: error }, "Failed to load Korean news");
    res.status(502).json({ error: "Korean news is temporarily unavailable." });
  }
});

export default router;
