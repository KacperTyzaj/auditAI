import { promises as fs } from "fs";
import path from "path";
import type { AuditRecord } from "./types";

/**
 * Prosty magazyn audytów w plikach JSON (katalog ./data) na czas rozwoju.
 * Na produkcji (np. Vercel) system plików jest ulotny, więc ten moduł
 * zastąpimy bazą danych (Supabase/Postgres) z tym samym interfejsem.
 */
const DIR = path.join(process.cwd(), "data", "audits");
const ID_RE = /^[a-z0-9-]{8,64}$/;

async function ensureDir() {
  await fs.mkdir(DIR, { recursive: true });
}

export async function saveAudit(record: AuditRecord): Promise<void> {
  await ensureDir();
  await fs.writeFile(path.join(DIR, `${record.id}.json`), JSON.stringify(record, null, 2), "utf8");
}

export async function getAudit(id: string): Promise<AuditRecord | null> {
  if (!ID_RE.test(id)) return null;
  try {
    return JSON.parse(await fs.readFile(path.join(DIR, `${id}.json`), "utf8")) as AuditRecord;
  } catch {
    return null;
  }
}

export async function listAudits(): Promise<AuditRecord[]> {
  await ensureDir();
  const files = (await fs.readdir(DIR)).filter((f) => f.endsWith(".json"));
  const records = await Promise.all(files.map((f) => getAudit(f.slice(0, -5))));
  return records
    .filter((r): r is AuditRecord => r !== null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function markBooked(id: string): Promise<boolean> {
  const record = await getAudit(id);
  if (!record) return false;
  record.bookedConsultation = true;
  await saveAudit(record);
  return true;
}
