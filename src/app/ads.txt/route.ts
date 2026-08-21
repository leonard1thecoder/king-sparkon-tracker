export const dynamic = "force-static";

export function GET() {
  const body = "google.com, pub-8918343184695576, DIRECT, f08c47fec0942fa0\n";
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
