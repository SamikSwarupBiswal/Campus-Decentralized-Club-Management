import { test, expect } from "@playwright/test";
import { Wallet } from "ethers";

test("landing links, workspace, and responsive layout", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Your campus.Your voice.On record.");
  await page.setViewportSize({ width: 1536, height: 1024 });
  await page.waitForTimeout(2500); // Allow the intentional entry animation to finish for visual evidence.
  await page.screenshot({ path: "test-results/landing-desktop.png", fullPage: true });
  await page.getByRole("link", { name: "How it works" }).first().click();
  await expect(page.getByRole("heading", { name: "Make it collective" })).toBeInViewport();
  const composer = page.getByRole("textbox", { name: "Compose a proposal" });
  await composer.fill("Request /fu");
  await page.getByRole("button", { name: /\/fund/ }).click();
  await expect(composer).toHaveValue("Request /fund ");
  await page.getByRole("button", { name: "Create proposal" }).click();
  await expect(page).toHaveURL(/login/);
  await expect(page.getByRole("heading", { name: "Enter with MetaMask." })).toBeVisible();
  await page.setViewportSize({ width: 1536, height: 1024 });
  await page.screenshot({ path: "test-results/login-desktop.png", fullPage: true });
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/login/);
  await expect(page.getByRole("button", { name: /MetaMask/ })).toBeVisible();
  for (const path of ["/", "/login"]) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    expect(overflow, path + " must not overflow horizontally").toBe(false);
    if (path === "/" || path === "/proposals") {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.waitForTimeout(200);
      await page.screenshot({ path: `test-results/${path === "/" ? "landing" : "proposals"}-mobile.png`, fullPage: true });
    }
  }
});

test("signed authentication rejects bad signatures, replay, altered messages, and foreign origins", async ({ request }) => {
  const wallet = Wallet.createRandom();
  const challengeResponse = await request.post("/api/auth/challenge", { data: { address: wallet.address } });
  expect(challengeResponse.status()).toBe(200);
  const { message } = await challengeResponse.json();
  expect(message).toContain("Site: http://127.0.0.1:3000");
  expect(message).toContain("Chain ID: 11155111");
  const signature = await wallet.signMessage(message);
  const bad = await request.post("/api/auth/verify", { data: { address: wallet.address, message, signature: await Wallet.createRandom().signMessage(message) } });
  expect(bad.status()).toBe(401);
  const valid = await request.post("/api/auth/verify", { data: { address: wallet.address, message, signature } });
  expect(valid.status()).toBe(200);
  expect(valid.headers()["set-cookie"]).toContain("HttpOnly");
  expect(valid.headers()["set-cookie"]).not.toMatch(/Max-Age|Expires/i);
  expect((await (await request.get("/api/auth/session")).json()).address).toBe(wallet.address.toLowerCase());
  expect((await request.post("/api/auth/verify", { data: { address: wallet.address, message, signature } })).status()).toBe(401);
  expect((await request.post("/api/auth/challenge", { headers: { origin: "https://foreign.example" }, data: { address: wallet.address } })).status()).toBe(403);
  expect((await request.post("/api/auth/challenge", { data: "{broken", headers: { "content-type": "application/json" } })).status()).toBe(400);
  await request.post("/api/auth/logout");
  expect((await (await request.get("/api/auth/session")).json()).address).toBeNull();
  const challenge2 = await (await request.post("/api/auth/challenge", { data: { address: wallet.address } })).json();
  const altered = challenge2.message + " changed";
  expect((await request.post("/api/auth/verify", { data: { address: wallet.address, message: altered, signature: await wallet.signMessage(altered) } })).status()).toBe(401);
  expect((await request.post("/api/members", { data: {} })).status()).toBe(401);
});

test("wallet UI connects, signs in, and clears the server session on sign-out", async ({ page }) => {
  // Test-only EIP-1193 provider: exercises Wagmi and real server signature verification.
  const wallet = Wallet.createRandom();
  await page.exposeFunction("testSign", (hex: string) => wallet.signMessage(Buffer.from(hex.slice(2), "hex")));
  await page.addInitScript(({ address }) => {
    let connected = false;
    const provider = {
      isMetaMask: true,
      on() {}, removeListener() {},
      async request({ method, params }: { method: string; params?: string[] }) {
        if (method === "eth_chainId") return "0x13882";
        if (method === "eth_accounts") return connected ? [address] : [];
        if (method === "eth_requestAccounts") { connected = true; return [address]; }
        if (method === "personal_sign") return (window as unknown as { testSign: (message: string) => Promise<string> }).testSign(params![0]);
        if (method === "wallet_requestPermissions") return [{ parentCapability: "eth_accounts" }];
        if (method === "wallet_revokePermissions") { connected = false; return null; }
        throw new Error("Unsupported test RPC: " + method);
      },
    };
    Object.defineProperty(window, "ethereum", { value: provider });
  }, { address: wallet.address });
  await page.goto("/login");
  await page.getByRole("checkbox", { name: /Keep me signed in/ }).check();
  await page.getByRole("button", { name: /MetaMask/ }).click();
  // New member onboarding flow: must register with name before entering dashboard
  await expect(page).toHaveURL(/register/);
  await page.getByLabel(/Full name/).fill("Test Member");
  await page.getByRole("button", { name: /Enter workspace/ }).click();
  await expect(page).toHaveURL(/dashboard/);
  await expect(page.getByText("A little less permission.")).toBeVisible();
  // Member must not see the Admin console navigation tab
  await expect(page.getByRole("link", { name: "Admin console" })).toHaveCount(0);
  // Member must not see the Admin check-in scanner on attendance page
  await page.goto("/attendance");
  await expect(page.getByText("Admin check-in")).toHaveCount(0);
  expect((await (await page.request.get("/api/auth/session")).json()).address).toBe(wallet.address.toLowerCase());
  const cookie = (await page.context().cookies()).find(cookie => cookie.name === "campus_dao_session")!;
  expect(cookie.expires - Date.now() / 1000).toBeGreaterThan(29 * 86400);
  // Reload with the provider temporarily disconnected: the valid server session must survive.
  await page.reload();
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/dashboard/);
  await page.goto("/settings");
  await expect(page.getByRole("heading", { name: "Signed-in session" })).toBeVisible();
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL(/login/);
  await expect.poll(async () => (await (await page.request.get("/api/auth/session")).json()).address).toBeNull();
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/login/);
  expect((await (await page.request.get("/api/auth/session")).json()).address).toBeNull();
});

test("remember-me expiry is signed and its input is validated", async ({ request }) => {
  const wallet = Wallet.createRandom();
  const { message } = await (await request.post("/api/auth/challenge", { data: { address: wallet.address } })).json();
  const data = { address: wallet.address, message, signature: await wallet.signMessage(message) };
  expect((await request.post("/api/auth/verify", { data: { ...data, rememberMe: "true" } })).status()).toBe(400);
  const response = await request.post("/api/auth/verify", { data: { ...data, rememberMe: true } });
  expect(response.status()).toBe(200);
  expect(response.headers()["set-cookie"]).toContain("Max-Age=2592000");
  const token = response.headers()["set-cookie"].split(";")[0].split("=")[1];
  const payload = JSON.parse(Buffer.from(token.split(".")[0], "base64url").toString());
  expect(payload.expiresAt - payload.issuedAt).toBe(2592000);
});

test("voting enforces strictly one vote per member and rejects duplicate ballots", async ({ request }) => {
  const wallet = Wallet.createRandom();
  const { message } = await (await request.post("/api/auth/challenge", { data: { address: wallet.address } })).json();
  const verifyRes = await request.post("/api/auth/verify", {
    data: { address: wallet.address, message, signature: await wallet.signMessage(message) }
  });
  expect(verifyRes.status()).toBe(200);

  // Register membership
  const regRes = await request.post("/api/members/register", {
    data: { name: "Test Voter", studentId: "VOTE-01", department: "CS", year: "3rd year" }
  });
  expect(regRes.status()).toBe(200);

  // Check ballot status before voting
  const beforeRes = await request.get(`/api/proposals/prop-104?voter=${wallet.address}`);
  expect(beforeRes.status()).toBe(200);
  const beforeData = await beforeRes.json();
  expect(beforeData.hasVoted).toBe(false);
  const initialYesVotes = beforeData.proposal.yesVotes;

  // First vote: must succeed
  const testTxHash = "0x" + "ab".repeat(32);
  const vote1 = await request.post("/api/proposals/prop-104", {
    data: { choice: "YES", voter: wallet.address, txHash: testTxHash }
  });
  expect(vote1.status()).toBe(200);
  const vote1Data = await vote1.json();
  expect(vote1Data.ok).toBe(true);
  expect(vote1Data.proposal.yesVotes).toBe(initialYesVotes + 1);

  // Check ballot status after voting: must reflect recorded vote and txHash
  const afterRes = await request.get(`/api/proposals/prop-104?voter=${wallet.address}`);
  expect(afterRes.status()).toBe(200);
  const afterData = await afterRes.json();
  expect(afterData.hasVoted).toBe(true);
  expect(afterData.userChoice).toBe("YES");
  expect(afterData.txHash).toBe(testTxHash);

  // Second vote (duplicate attempt): must be rejected with 400
  const vote2 = await request.post("/api/proposals/prop-104", {
    data: { choice: "YES", voter: wallet.address }
  });
  expect(vote2.status()).toBe(400);
  const vote2Data = await vote2.json();
  expect(vote2Data.error).toContain("already cast a ballot");

  // Verify vote count was not incremented again
  const finalRes = await request.get("/api/proposals/prop-104");
  const finalData = await finalRes.json();
  expect(finalData.proposal.yesVotes).toBe(initialYesVotes + 1);
});
