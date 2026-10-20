import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { auditTexts } from "@/lib/ai";
import { computeAudit } from "@/lib/scoring";
import { saveAudit } from "@/lib/store";
import type { AuditRecord } from "@/lib/types";
import { parseAuditInput } from "@/lib/validation";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = parseAuditInput(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const result = computeAudit(parsed.input);
  const texts = await auditTexts(parsed.input, result);
  const record: AuditRecord = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    input: parsed.input,
    result,
    texts,
    bookedConsultation: false,
  };
  await saveAudit(record);
  // TODO: e-mail z raportem do klienta i powiadomienie do firmy (np. Resend).
  return NextResponse.json({ id: record.id });
}
