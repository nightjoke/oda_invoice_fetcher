import { hentOdaFakturaer } from "../../lib/oda";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const { odaEmail, odaPassword } = req.body;

  console.log("🔐 Mottatt innlogging:", odaEmail);

  if (!odaEmail || !odaPassword) {
    console.log("❌ Mangler brukernavn/passord");
    return res.status(400).json({ success: false, error: "Mangler innloggingsinformasjon" });
  }

  try {
    console.log("🚀 Starter fakturahenting...");
    const filer = await hentOdaFakturaer(odaEmail, odaPassword);
    console.log("✅ Fakturaer hentet:", filer);
    res.status(200).json({ success: true, filer });
  } catch (err) {
    console.error("🔥 Feil ved henting:", err);
    res.status(500).json({ success: false, error: "Feil ved henting av fakturaer" });
  }
}
