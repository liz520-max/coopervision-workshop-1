// Vercel Serverless Function
// 여러 팀의 점수를 모든 참가자/강사가 함께 보는 "공유 저장소" 역할입니다.
// 무료 Upstash Redis(https://upstash.com)를 사용합니다.
// Vercel 프로젝트 설정 > Environment Variables 에 아래 두 개를 등록하세요:
//   UPSTASH_REDIS_REST_URL
//   UPSTASH_REDIS_REST_TOKEN
// (Vercel 대시보드 > Storage 탭에서 Upstash Redis를 바로 추가하면 자동으로 등록됩니다.)

const BASE = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function redisGet(key) {
  const r = await fetch(`${BASE}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  const data = await r.json();
  return data.result ? JSON.parse(data.result) : [];
}

async function redisSet(key, value) {
  await fetch(`${BASE}/set/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "text/plain" },
    body: JSON.stringify(value),
  });
}

export default async function handler(req, res) {
  if (!BASE || !TOKEN) {
    // Redis 미설정 시에도 앱이 죽지 않도록 빈 목록 응답 (팀별 로컬 결과는 각자 화면에서만 보임)
    if (req.method === "GET") return res.status(200).json({ teams: [] });
    return res.status(200).json({ ok: true, warning: "저장소가 설정되지 않아 저장되지 않았습니다." });
  }

  const key = (req.query?.key || req.body?.key || "workshop-cv-v9").toString();

  try {
    if (req.method === "GET") {
      const teams = await redisGet(key);
      res.status(200).json({ teams });
      return;
    }
    if (req.method === "POST") {
      const { teams } = req.body || {};
      if (!Array.isArray(teams)) {
        res.status(400).json({ error: "teams 배열이 필요합니다." });
        return;
      }
      await redisSet(key, teams);
      res.status(200).json({ ok: true });
      return;
    }
    if (req.method === "DELETE") {
      await redisSet(key, []);
      res.status(200).json({ ok: true });
      return;
    }
    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    res.status(500).json({ error: err.message || "알 수 없는 오류" });
  }
}
