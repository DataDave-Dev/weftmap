import { test, expect, type Page } from "@playwright/test";

const SITE_URL = "https://weftmap.vercel.app";

declare global {
  interface Window {
    __cspViolations: string[];
  }
}

// The CSP is built per request in src/proxy.ts and has no 'unsafe-inline' in
// either dev or production — only 'unsafe-eval' differs — so the nonce path
// this test exercises is the same one that runs in production.
async function collectCspViolations(page: Page, path: string) {
  await page.addInitScript(() => {
    window.__cspViolations = [];
    document.addEventListener("securitypolicyviolation", (event) => {
      window.__cspViolations.push(
        `${event.violatedDirective} blocked ${event.blockedURI}`,
      );
    });
  });
  await page.goto(path);
  return page.evaluate(() => window.__cspViolations);
}

test("homepage emits JSON-LD that the CSP does not block", async ({ page }) => {
  const violations = await collectCspViolations(page, "/en");
  expect(violations).toEqual([]);

  // The nonce has to be checked in the server HTML, not the DOM: browsers blank
  // the attribute once the CSP is applied, so page.locator() always sees "".
  const response = await page.request.get("/en");
  const html = await response.text();
  const csp = response.headers()["content-security-policy"];
  const scriptNonce = html.match(
    /<script type="application\/ld\+json" nonce="([^"]+)"/,
  )?.[1];
  expect(scriptNonce, "JSON-LD script carries a nonce").toBeTruthy();
  expect(csp).toContain(`nonce-${scriptNonce}`);

  const script = page.locator('script[type="application/ld+json"]');
  await expect(script).toHaveCount(1);

  const types = await script.evaluate((el) => {
    const parsed = JSON.parse(el.textContent ?? "[]");
    return (Array.isArray(parsed) ? parsed : [parsed]).map(
      (node: { "@type": string }) => node["@type"],
    );
  });
  expect(types).toEqual([
    "SoftwareApplication",
    "Organization",
    "FAQPage",
  ]);
});

test("FAQ structured data matches the questions rendered on the page", async ({
  page,
}) => {
  await page.goto("/en");

  const schemaQuestions = await page
    .locator('script[type="application/ld+json"]')
    .evaluate((el) => {
      const nodes = JSON.parse(el.textContent ?? "[]");
      const faq = nodes.find(
        (node: { "@type": string }) => node["@type"] === "FAQPage",
      );
      return faq.mainEntity.map((q: { name: string }) => q.name);
    });

  expect(schemaQuestions.length).toBeGreaterThan(0);
  for (const question of schemaQuestions) {
    // The question sits in a <summary> next to a "+" glyph, so match on the
    // summary containing it rather than on exact text.
    await expect(
      page.locator("#faq summary").filter({ hasText: question }),
    ).toBeVisible();
  }
});

test("docs page emits TechArticle and breadcrumbs", async ({ page }) => {
  const violations = await collectCspViolations(page, "/es/docs/languages");
  expect(violations).toEqual([]);

  const types = await page
    .locator('script[type="application/ld+json"]')
    .evaluate((el) =>
      JSON.parse(el.textContent ?? "[]").map(
        (node: { "@type": string }) => node["@type"],
      ),
    );
  expect(types).toEqual(["TechArticle", "BreadcrumbList"]);
});

test("indexable pages carry canonical, hreflang and a social card", async ({
  page,
}) => {
  await page.goto("/es/docs/languages");

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    `${SITE_URL}/es/docs/languages`,
  );
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    "content",
    `${SITE_URL}/es/docs/languages`,
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image",
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    new RegExp(`^${SITE_URL}/es/opengraph-image`),
  );

  // Six locales plus x-default, all pointing at the same document.
  await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(7);

  const description = await page
    .locator('meta[name="description"]')
    .getAttribute("content");
  expect(description?.length).toBeGreaterThan(0);
});

test("auth-gated routes are noindex and carry no structured data", async ({
  page,
}) => {
  await page.goto("/en/graphs");

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
  await expect(
    page.locator('script[type="application/ld+json"]'),
  ).toHaveCount(0);
});
