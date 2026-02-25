import { NextRequest, NextResponse } from "next/server";

const ACCESS_TOKEN_MAX_AGE = 60 * 60; // 1 hour
const ID_TOKEN_MAX_AGE = 60 * 60; // 1 hour
const REFRESH_TOKEN_MAX_AGE_DEFAULT = 60 * 60 * 24; // 1 day
const REFRESH_TOKEN_MAX_AGE_REMEMBER = 60 * 60 * 24 * 30; // 30 days

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken, idToken, refreshToken, rememberMe } = body ?? {};

    if (!accessToken || !idToken || !refreshToken) {
      return NextResponse.json(
        { error: "Missing tokens." },
        { status: 400 }
      );
    }

    const response = NextResponse.json({ ok: true });
    const isProd = process.env.NODE_ENV === "production";
    const refreshMaxAge = rememberMe
      ? REFRESH_TOKEN_MAX_AGE_REMEMBER
      : REFRESH_TOKEN_MAX_AGE_DEFAULT;

    response.cookies.set("goobiez_access_token", accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: ACCESS_TOKEN_MAX_AGE,
      path: "/",
    });
    response.cookies.set("goobiez_id_token", idToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: ID_TOKEN_MAX_AGE,
      path: "/",
    });
    response.cookies.set("goobiez_refresh_token", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: refreshMaxAge,
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create session." },
      { status: 500 }
    );
  }
}
