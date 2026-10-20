import { NextResponse } from "next/server";
import { z } from "zod";
import { followUpQuestion } from "@/lib/ai";
import { AREA_IDS } from "@/lib/catalog";
import type { AreaId } from "@/lib/types";

const body = z.object({
  area: z.enum(AREA_IDS as [AreaId, ...AreaId[]]),
  pain: z.string().max(2000),
  tasks: z.array(z.string().max(200)).max(10),
});

export async function POST(req: Request) {
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Niepoprawne dane." }, { status: 400 });
  return NextResponse.json(await followUpQuestion(parsed.data.area, parsed.data.pain, parsed.data.tasks));
}
