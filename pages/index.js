import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [filer, setFiler] = useState([]);
  const [loading, setLoading] = useState(false);

  async function hentFakturaer(e) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/hent-fakturaer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ odaEmail: email, odaPassword: password }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) setFiler(data.filer);
    else alert("Feil: " + data.error);
  }

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>Hent fakturaer fra Oda.no</h1>
      <form onSubmit={hentFakturaer} style={{ display: "flex", flexDirection: "column", maxWidth: 400 }}>
        <input placeholder="E-post" value={email} onChange={e => setEmail(e.target.value)} required />
        <input placeholder="Passord" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button disabled={loading}>{loading ? "Henter..." : "Hent fakturaer"}</button>
      </form>

      {filer.length > 0 && (
        <div style={{ marginTop: 30 }}>
          <h2>Fakturaer:</h2>
          <ul>
            {filer.map((fil, i) => (
              <li key={i}><a href={fil} target="_blank" rel="noreferrer">{fil}</a></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
