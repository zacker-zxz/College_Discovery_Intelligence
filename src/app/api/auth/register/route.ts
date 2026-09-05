import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken, setSessionCookie } from "@/lib/auth";
import { registerSchema } from "@/validators/schemas";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = rateLimit(`register:${ip}`, { windowMs: 60 * 60 * 1000, maxRequests: 5 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many registration attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  try {
    const body = await req.json();
    const validated = registerSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: "Validation failed", details: validated.error.format() }, { status: 400 });
    }

    const { email, name, password } = validated.data;
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email address already exists" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        passwordHash,
        role: "STUDENT",
      },
    });

    const token = await signToken({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    });

    await setSessionCookie(token);

    return NextResponse.json(
      {
        user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Account creation failed" }, { status: 500 });
  }
}
