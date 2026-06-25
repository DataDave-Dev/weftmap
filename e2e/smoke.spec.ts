import { test, expect } from "@playwright/test";

test("should load app, click analyze on default snippet, and render call graph nodes", async ({
  page,
}) => {
  // 1. Visit the app in English locale
  await page.goto("/en/app");

  // 2. Locate the textarea for code input and verify it is visible
  const textarea = page.locator("textarea");
  await expect(textarea).toBeVisible();

  // 3. Click the "Analyze" button (using the default Python sample code)
  const analyzeBtn = page.getByRole("button", { name: /^Analyze$/ });
  await expect(analyzeBtn).toBeEnabled();
  await analyzeBtn.click();

  // 4. Assert that the React Flow workspace container is rendered
  const reactFlow = page.locator(".react-flow");
  await expect(reactFlow).toBeVisible();

  // 5. Assert that we successfully render 6 nodes (1 file container + 5 defined functions)
  const nodes = page.locator(".react-flow__node");
  await expect(nodes).toHaveCount(6);

  // 6. Verify key node labels contain our function names and container file
  await expect(
    page.locator(".react-flow__node", { hasText: "snippet.py" }),
  ).toBeVisible();
  await expect(
    page.locator(".react-flow__node", { hasText: "main" }),
  ).toBeVisible();
  await expect(
    page.locator(".react-flow__node", { hasText: "clean" }),
  ).toBeVisible();
});
