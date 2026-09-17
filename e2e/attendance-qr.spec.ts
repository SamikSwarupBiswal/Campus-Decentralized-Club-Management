import { test, expect } from "@playwright/test";
import { Wallet } from "ethers";
import QRCode from "qrcode";

test("one click connects and generates a QR containing the signing wallet", async ({ page }) => {
  test.setTimeout(90_000);
  const wallet = Wallet.createRandom();
  const auth = await (await page.request.post("/api/auth/challenge", { data: { address: wallet.address } })).json();
  expect((await page.request.post("/api/auth/verify", { data: {
    address: wallet.address, message: auth.message, signature: await wallet.signMessage(auth.message),
  } })).status()).toBe(200);
  expect((await page.request.post("/api/members/register", { data: { name: "QR Regression" } })).status()).toBe(200);

  await page.exposeFunction("attendanceSign", (hex: string) => wallet.signMessage(Buffer.from(hex.slice(2), "hex")));
  await page.addInitScript(({ address }) => {
    let connected = false;
    Object.defineProperty(window, "ethereum", { value: {
      isMetaMask: true, on() {}, removeListener() {},
      async request({ method, params }: { method: string; params?: string[] }) {
        if (method === "eth_chainId") return "0xaa36a7";
        if (method === "eth_accounts") return connected ? [address] : [];
        if (method === "eth_requestAccounts") { connected = true; return [address]; }
        if (method === "wallet_requestPermissions") return [{ parentCapability: "eth_accounts" }];
        if (method === "personal_sign") return (window as unknown as { attendanceSign: (hex: string) => Promise<string> }).attendanceSign(params![0]);
        throw new Error("Unexpected RPC: " + method);
      },
    } });
  }, { address: wallet.address });
  await page.goto("/events/evt-campus-hacklab");
  const response = page.waitForResponse("**/api/attendance/challenge");
  await page.getByRole("button", { name: "Sign & generate QR" }).click();
  const challengeResponse = await response;
  expect(challengeResponse.status()).toBe(200);
  const challenge = await challengeResponse.json();
  const payload = JSON.stringify({ eventId: "evt-campus-hacklab", wallet: wallet.address,
    timestamp: challenge.timestamp, nonce: challenge.nonce,
    signature: await wallet.signMessage(challenge.message) });
  const expected = await QRCode.toDataURL(payload, { width: 560, margin: 2,
    color: { dark: "#000000", light: "#ffffff" }, errorCorrectionLevel: "L" });
  const qr = page.getByAltText("Short-lived signed attendance QR code");
  await expect(qr).toBeVisible();
  // Browser canvas and Node encode PNGs differently; compare decoded pixels.
  const samePixels = await page.evaluate(async (expectedSource) => {
    async function pixels(source: string) {
      const image = new Image();
      image.src = source;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.width; canvas.height = image.height;
      const context = canvas.getContext("2d")!;
      context.drawImage(image, 0, 0);
      return context.getImageData(0, 0, image.width, image.height).data;
    }
    const actual = await pixels(document.querySelector<HTMLImageElement>('.qr-image-wrap img')!.src);
    const expected = await pixels(expectedSource);
    return actual.length === expected.length && actual.every((value, index) => value === expected[index]);
  }, expected);
  expect(samePixels, "QR must encode the compact signed payload with low density").toBe(true);
  await expect(page.getByText(/Valid for/).last()).toBeVisible();
});

test("attendance challenge works without a session before contract deployment", async ({ request }) => {
  const response = await request.post("/api/attendance/challenge", { data: {
    eventId: "evt-campus-hacklab", wallet: "0x7A8f113604769cb18483B1Ac4B99a6cc9872f71B",
  } });
  expect(response.status()).toBe(200);
  expect((await response.json()).message).toContain("Campus DAO Attendance");
});

test("past event on 24 july is closed and rejects attendance challenge", async ({ request, page }) => {
  test.setTimeout(60_000);
  const response = await request.post("/api/attendance/challenge", { data: {
    eventId: "evt-robotics-workshop", wallet: Wallet.createRandom().address,
  } });
  expect(response.status()).toBe(403);
  const body = await response.json();
  expect(body.error).toContain("closed");

  const wallet = Wallet.createRandom();
  const auth = await (await page.request.post("/api/auth/challenge", { data: { address: wallet.address } })).json();
  expect((await page.request.post("/api/auth/verify", { data: {
    address: wallet.address, message: auth.message, signature: await wallet.signMessage(auth.message),
  } })).status()).toBe(200);
  expect((await page.request.post("/api/members/register", { data: { name: "QR Regression" } })).status()).toBe(200);

  await page.goto("/events/evt-robotics-workshop");
  await expect(page.getByText("Attendance closed").first()).toBeVisible();
  await expect(page.getByText("Event has ended")).toBeVisible();
});

test("admin scans attendee QR and sees the updated list of members who gave attendance", async ({ page }) => {
  test.setTimeout(90_000);

  // 1. Create and register a student member
  const studentWallet = Wallet.createRandom();
  const studentAuth = await (await page.request.post("/api/auth/challenge", { data: { address: studentWallet.address } })).json();
  expect((await page.request.post("/api/auth/verify", { data: {
    address: studentWallet.address, message: studentAuth.message, signature: await studentWallet.signMessage(studentAuth.message),
  } })).status()).toBe(200);
  const regRes = await page.request.post("/api/members/register", {
    data: { name: "Aarav Gupta", studentId: "CS24-999", department: "Computer Science" },
  });
  expect(regRes.status()).toBe(200);

  // 2. Member generates valid signed attendance QR payload for the active event
  const challengeRes = await (await page.request.post("/api/attendance/challenge", {
    data: { eventId: "evt-campus-hacklab", wallet: studentWallet.address },
  })).json();
  const signature = await studentWallet.signMessage(challengeRes.message);
  const payload = JSON.stringify({
    eventId: "evt-campus-hacklab",
    wallet: studentWallet.address,
    timestamp: challengeRes.timestamp,
    nonce: challengeRes.nonce,
    signature,
  });

  // 3. Now authenticate as Admin (Hardhat account #0)
  const adminWallet = new Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
  const adminAuth = await (await page.request.post("/api/auth/challenge", { data: { address: adminWallet.address } })).json();
  expect((await page.request.post("/api/auth/verify", { data: {
    address: adminWallet.address, message: adminAuth.message, signature: await adminWallet.signMessage(adminAuth.message),
  } })).status()).toBe(200);


  // 4. Admin visits /attendance page
  await page.goto("/attendance");
  await expect(page.getByText("Admin check-in")).toBeVisible();
  await expect(page.getByText("Scan attendance pass")).toBeVisible();

  // 5. Admin pastes QR payload and submits check-in
  await page.getByPlaceholder('{"eventId":"…","wallet":"0x…","signature":"0x…"}').fill(payload);
  await page.getByRole("button", { name: "Verify & check in" }).click();

  // 6. Verify success banner and attendee list display
  await expect(page.getByText("Attendance verified & recorded!")).toBeVisible();
  await expect(page.getByText("Checked-in Attendees")).toBeVisible();
  await expect(page.locator(".attendees-roster").getByText("Aarav Gupta")).toBeVisible();
  await expect(page.getByText(/CS24-999/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Scan next pass" })).toBeVisible();

  // 7. Verify that once checked in, requesting another QR challenge is blocked
  const secondChallengeRes = await page.request.post("/api/attendance/challenge", {
    data: { eventId: "evt-campus-hacklab", wallet: studentWallet.address },
  });
  expect(secondChallengeRes.status()).toBe(409);
  const secondChallengeBody = await secondChallengeRes.json();
  expect(secondChallengeBody.error).toContain("Attendance has already been recorded");
  expect(secondChallengeBody.alreadyCheckedIn).toBe(true);
});

test("attendance tab displays history of previous events and clicking an event reveals all attended users", async ({ page }) => {
  test.setTimeout(60_000);

  // Authenticate session so middleware allows /attendance
  const viewerWallet = Wallet.createRandom();
  const auth = await (await page.request.post("/api/auth/challenge", { data: { address: viewerWallet.address } })).json();
  expect((await page.request.post("/api/auth/verify", { data: {
    address: viewerWallet.address, message: auth.message, signature: await viewerWallet.signMessage(auth.message),
  } })).status()).toBe(200);
  expect((await page.request.post("/api/members/register", { data: { name: "History Viewer" } })).status()).toBe(200);

  await page.goto("/attendance");

  // Verify Event attendance history section is present
  await expect(page.getByText("Event attendance history")).toBeVisible();
  await expect(page.getByText("Interface Design Critique").first()).toBeVisible();
  await expect(page.getByText("Robotics Build Workshop").first()).toBeVisible();

  // Click on "Interface Design Critique"
  await page.getByText("Interface Design Critique").first().click();

  // Verify header updates to Interface Design Critique
  await expect(page.getByText("Interface Design Critique — Attended Users")).toBeVisible();

  // Verify attended members appear in the roster
  await expect(page.getByText("Ananya Rao").first()).toBeVisible();
  await expect(page.getByText("Vikram Sen").first()).toBeVisible();
  await expect(page.getByText("Present · Verified").first()).toBeVisible();

  // Click on "Robotics Build Workshop"
  await page.getByText("Robotics Build Workshop").first().click();
  await expect(page.getByText("Robotics Build Workshop — Attended Users")).toBeVisible();
  await expect(page.getByText("Meera Iyer").first()).toBeVisible();
});


