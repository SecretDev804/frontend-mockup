import { NextRequest, NextResponse } from "next/server";

type JwtPayload = {
  sub?: string;
  email?: string;
};

function decodeJwt(token: string): JwtPayload | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) {
      return null;
    }
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = Buffer.from(base64, "base64").toString("utf8");
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const idToken = request.cookies.get("goobiez_id_token")?.value;
  if (!idToken) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const payload = decodeJwt(idToken);
  if (!payload?.sub) {
    return NextResponse.json({ error: "Invalid session." }, { status: 401 });
  }

  return NextResponse.json({ sub: payload.sub, email: payload.email || null });
}
