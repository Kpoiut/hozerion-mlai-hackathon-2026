import privacyHtml from "../../public/privacy.html?raw";
import termsHtml from "../../public/terms.html?raw";

const PAGES: Record<string, string> = {
  "/privacy.html": privacyHtml,
  "/terms.html": termsHtml,
};

interface LegalEvent {
  url: URL;
  req: { method?: string };
}

export default function legalPages(event: LegalEvent, next: () => unknown): unknown {
  const method = (event.req.method ?? "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD") return next();
  const html = PAGES[event.url.pathname];
  if (!html) return next();
  return new Response(method === "HEAD" ? null : html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-cache",
    },
  });
}
