import { NextResponse, type NextRequest } from "next/server";

/** Panel firmy chroniony hasłem (HTTP Basic). Na start wystarczy; później logowanie przez Supabase. */
export function middleware(req: NextRequest) {
  const password = process.env.PANEL_PASSWORD;
  if (!password) {
    return new NextResponse("Ustaw PANEL_PASSWORD, żeby otworzyć panel.", { status: 503 });
  }
  const header = req.headers.get("authorization") ?? "";
  const [scheme, encoded] = header.split(" ");
  if (scheme === "Basic" && encoded) {
    const decoded = atob(encoded);
    const given = decoded.slice(decoded.indexOf(":") + 1);
    if (given === password) return NextResponse.next();
  }
  return new NextResponse("Wymagane logowanie.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="AuditAI panel", charset="UTF-8"' },
  });
}

export const config = { matcher: ["/panel/:path*"] };
