import puppeteer from "puppeteer";
import fs from "node:fs";
import path from "node:path";

export async function hentOdaFakturaer(email, password) {
  console.log("🧠 Starter Puppeteer...");
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 50,
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();

  await page.goto("https://oda.com/no/user/login/", { waitUntil: "networkidle0" });

  // 🍪 Godkjenn cookies om nødvendig
  try {
    await page.waitForSelector("button span.k-text-style--label-m", { timeout: 5000 });
    const buttons = await page.$x("//button[.//span[contains(text(), 'Godkjenn alle')]]");
    if (buttons.length > 0) {
      console.log("🍪 Godkjenner cookies...");
      await buttons[0].click();
      await page.waitForTimeout(1000);
    }
  } catch (err) {
    console.log("🚫 Ingen cookie-popup å godkjenne");
  }

  // ✉️ Fyll inn e-post
  await page.waitForSelector("#email-input", { timeout: 10000 });
  const emailInput = await page.$("#email-input");
  if (!emailInput) throw new Error("❌ Fant ikke e-postfeltet");
  await emailInput.click({ clickCount: 3 });
  await page.keyboard.type(email);

  // 🔐 Fyll inn passord
  await page.waitForSelector("#password-input", { timeout: 10000 });
  const passwordInput = await page.$("#password-input");
  if (!passwordInput) throw new Error("❌ Fant ikke passordfeltet");
  await passwordInput.click({ clickCount: 3 });
  await page.keyboard.type(password);

  // 🟠 Klikk "Logg inn"
  console.log("⏎ Trykker Enter for å logge inn...");
  await page.keyboard.press("Enter");
  await page.waitForNavigation({ waitUntil: "networkidle0" });
  

  // 📦 Gå til fakturaer
  await page.goto("https://oda.com/no/account/orders/", { waitUntil: "networkidle0" });

  // 🧾 Finn faktura-lenker
  const fakturaer = await page.evaluate(() => {
    const lenker = document.querySelectorAll("a[href^='/no/invoice/']");
    return Array.from(lenker).map(link => {
      const url = "https://oda.com" + link.getAttribute("href");
      const id = link.innerText.trim() || "faktura";
      return { id, url };
    });
  });
  console.log("🧾 Fant faktura-lenker:", fakturaer);

  // 💾 Last ned PDF-er
  const outputPath = path.join(process.cwd(), "public", "fakturaer");
  if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath, { recursive: true });

  const nedlastede = [];
  for (const faktura of fakturaer) {
    const fakturaPage = await page.goto(faktura.url);
    const buffer = await fakturaPage.buffer();

    const filename = `oda-faktura-${faktura.id}.pdf`;
    const filePath = path.join(outputPath, filename);
    fs.writeFileSync(filePath, buffer);
    nedlastede.push(`/fakturaer/${filename}`);
  }

  await browser.close();
  return nedlastede;
}
