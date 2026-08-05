import { test, expect } from "@playwright/test";

test("displays a greeting", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("Greetings Daggernauts");
});

test("changes the greeting when the button is clicked", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#greetingDisplay")).toContainText(
    "Click the button to see a greeting!",
  );
  await page.click("#randomGreetingButton");
  await expect(page.locator("#greetingDisplay")).not.toContainText(
    "Click the button to see a greeting!",
  );
});
