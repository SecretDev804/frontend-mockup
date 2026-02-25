import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ ok: true });

  response.cookies.set("goobiez_access_token", "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });
  response.cookies.set("goobiez_id_token", "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });
  response.cookies.set("goobiez_refresh_token", "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });

  return response;
}
