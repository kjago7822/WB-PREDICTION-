// Cloudflare Worker + D1: pengganti JSONBin
// Setup D1 (sekali saja, di Console D1):
//   CREATE TABLE kv (k TEXT PRIMARY KEY, v TEXT NOT NULL);
// Bind database ke Worker dengan nama DB.
// Endpoint: GET / PUT / DELETE  /<akun>/<key>

const MAX_BYTES = 200 * 1024;

const CORS = {
  "Access-Control-Allow-Origin": "*", // ganti ke domain GitHub Pages kamu
  "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });

export default {
  async fetch(req, env) {
    if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

    const [akun, key] = new URL(req.url).pathname.split("/").filter(Boolean);
    if (!akun || !key || !/^[\w-]+$/.test(akun) || !/^[\w-]+$/.test(key))
      return json({ error: "path salah" }, 400);
    const k = `${akun}:${key}`;

    if (req.method === "GET") {
      const row = await env.DB.prepare("SELECT v FROM kv WHERE k = ?").bind(k).first();
      return json(row ? JSON.parse(row.v) : null);
    }

    if (req.method === "PUT") {
      const body = await req.text();
      if (body.length > MAX_BYTES) return json({ error: "terlalu besar" }, 413);
      try { JSON.parse(body); } catch { return json({ error: "bukan JSON" }, 400); }
      await env.DB.prepare(
        "INSERT INTO kv (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v"
      ).bind(k, body).run();
      return json({ ok: true });
    }

    if (req.method === "DELETE") {
      await env.DB.prepare("DELETE FROM kv WHERE k = ?").bind(k).run();
      return json({ ok: true });
    }

    return json({ error: "method tidak didukung" }, 405);
  },
};
