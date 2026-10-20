import { NextResponse } from "next/server";
import { markBooked } from "@/lib/store";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ok = await markBooked(id);
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Nie znaleziono audytu." }, { status: 404 });
}
