import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken, setSessionCookie } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// Server-side demo login. Only active when ENABLE_DEMO_ACCOUNTS is explicitly
// set (e.g. preview deployments). Credentials never ship to the client bundle.
const DEMO_ACCOUNTS: Record<string, string> = {
  "student@campuslens.edu": "Password123!",
  "admin@campuslens.edu": "Password123!",
};

export async function GET() {
  return NextResponse.json({ enabled: process.env.ENABLE_DEMO_ACCOUNTS === "true" });
}

export async function POST(req: NextRequest) {
  if (process.env.ENABLE_DEMO_ACCOUNTS !== "true") {
    return NextResponse.json({ error: "Demo accounts are disabled on this deployment" }, { status: 404 });
  }

  const ip = getClientIp(req);
  const limit = rateLimit(`demo-login:${ip}`, { windowMs: 15 * 60 * 1000, maxRequests: 10 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many demo login attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  try {
    const body = await req.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email.toLowerCase() : "";

    if (!Object.prototype.hasOwnProperty.call(DEMO_ACCOUNTS, email)) {
      return NextResponse.json({ error: "Invalid demo account" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Demo account not seeded in this environment" }, { status: 404 });
    }

    const match = await verifyPassword(DEMO_ACCOUNTS[email], user.passwordHash);
    if (!match) {
      return NextResponse.json({ error: "Demo login failed" }, { status: 401 });
    }

    const token = await signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error("Demo login error:", error);
    return NextResponse.json({ error: "Demo authentication failed" }, { status: 500 });
  }
}
