export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    message: "API health check passed",
    time: new Date().toISOString()
  });
}
