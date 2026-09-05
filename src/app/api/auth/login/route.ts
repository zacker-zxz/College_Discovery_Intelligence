import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken, setSessionCookie } from "@/lib/auth";
import { loginSchema } from "@/validators/schemas";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = rateLimit(`login:${ip}`, { windowMs: 15 * 60 * 1000, maxRequests: 10 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  try {
    const body = await req.json();
    const validated = loginSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: "Validation failed", details: validated.error.format() }, { status: 400 });
    }

    const { email, password } = validated.data;
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const match = await verifyPassword(password, user.passwordHash);
    if (!match) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
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
    console.error("Login error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
