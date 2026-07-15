import { test, expect, type Page } from "@playwright/test";

const password = "SupportFlowDemo2026!";

async function login(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  const responsePromise = page.waitForResponse((response) => response.url().includes("/api/auth/login"));
  await page.getByRole("button", { name: /sign in/i }).click();
  expect((await responsePromise).status()).toBe(200);
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 15_000 });
}

async function choose(page: Page, label: string, option: string) {
  await page.getByRole("combobox", { name: label }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

async function findTicket(page: Page, title: string) {
  await page.getByPlaceholder("Search by ticket title...").fill(title);
  await page.getByRole("button", { name: "Apply filters" }).click();
  const ticketLink = page.getByRole("link", { name: title, exact: true });
  const href = await ticketLink.getAttribute("href");
  expect(href).toBeTruthy();
  await page.goto(href!);
  await expect(page.getByText("Live", { exact: true })).toBeVisible();
}

test("customer to admin to agent ticket workflow with realtime reply", async ({ browser }) => {
  const title = `E2E technical request ${Date.now()}`;
  const customer = await browser.newContext();
  const admin = await browser.newContext();
  const agent = await browser.newContext();
  const customerPage = await customer.newPage();
  const adminPage = await admin.newPage();
  const agentPage = await agent.newPage();

  await login(customerPage, "customer@acme.demo");
  await customerPage.getByRole("link", { name: /create ticket/i }).click();
  await choose(customerPage, "Category", "Technical");
  await choose(customerPage, "Priority", "High");
  await customerPage.getByLabel("Title").fill(title);
  await customerPage.getByLabel("Description").fill("The complete browser workflow needs a detailed technical support request.");
  await customerPage.getByRole("button", { name: "Create ticket" }).click();
  await expect(customerPage.getByRole("heading", { name: title })).toBeVisible();

  await login(adminPage, "admin@acme.demo");
  await adminPage.goto("/dashboard/tickets");
  await findTicket(adminPage, title);
  const assignResponse = adminPage.waitForResponse((response) => response.url().includes("/assignment"));
  await choose(adminPage, "Assigned agent", "Noah Carter");
  expect((await assignResponse).status()).toBe(200);

  await login(agentPage, "agent@acme.demo");
  await agentPage.goto("/dashboard/tickets");
  await findTicket(agentPage, title);
  const progressResponse = agentPage.waitForResponse((response) => response.url().includes("/status"));
  await choose(agentPage, "Status", "In Progress");
  expect((await progressResponse).status()).toBe(200);
  await agentPage.reload();
  await expect(agentPage.getByText("In Progress", { exact: true }).first()).toBeVisible();
  await expect(agentPage.getByText("Live", { exact: true })).toBeVisible();

  await customerPage.reload();
  await expect(customerPage.getByRole("heading", { name: title })).toBeVisible();
  await expect(customerPage.getByText("Live", { exact: true })).toBeVisible();
  const reply = "We found the cause and are applying the fix now.";
  await agentPage.getByPlaceholder("Write a helpful reply...").fill(reply);
  const commentResponse = agentPage.waitForResponse((response) => response.url().includes("/comments"));
  await agentPage.getByRole("button", { name: /send reply/i }).click();
  expect((await commentResponse).status()).toBe(201);
  await expect(customerPage.getByText(reply)).toBeVisible({ timeout: 20_000 });

  const resolveResponse = agentPage.waitForResponse((response) => response.url().includes("/status"));
  await choose(agentPage, "Status", "Resolved");
  expect((await resolveResponse).status()).toBe(200);
  await customerPage.reload();
  const closeResponse = customerPage.waitForResponse((response) => response.url().includes("/status"));
  await choose(customerPage, "Status", "Closed");
  expect((await closeResponse).status()).toBe(200);
  await customerPage.reload();
  await expect(customerPage.getByText("Closed", { exact: true }).first()).toBeVisible();
  await customer.close();
  await admin.close();
  await agent.close();
});
