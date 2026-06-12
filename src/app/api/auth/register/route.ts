import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/session";
import { getInviteCode } from "@/lib/settings";

const schema = z.object({
  name: z.string().trim().min(2, "Nome muito curto").max(40),
  email: z.string().trim().toLowerCase().email("Email inválido"),
  password: z.string().min(6, "A senha precisa de pelo menos 6 caracteres"),
  inviteCode: z.string().trim().min(1, "Informe o código de convite"),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }
  const { name, email, password, inviteCode } = parsed.data;

  const expectedCode = await getInviteCode();
  if (inviteCode.toUpperCase() !== expectedCode.toUpperCase()) {
    return NextResponse.json(
      { error: "Código de convite inválido" },
      { status: 403 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Já existe uma conta com esse email" },
      { status: 409 }
    );
  }

  // o primeiro usuário registrado vira admin
  const userCount = await prisma.user.count();
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      isAdmin: userCount === 0,
    },
  });

  await createSession({
    id: user.id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
  });
  return NextResponse.json({ ok: true });
}
