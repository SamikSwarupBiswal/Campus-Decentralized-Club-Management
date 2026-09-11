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
    eventId: "evt-campus-hacklab", wallet: Wallet.createRandom().address,
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
