"use client";

import { useState } from "react";

export function BookButton({ id, bookingUrl }: { id: string; bookingUrl: string }) {
  const [done, setDone] = useState(false);
  async function book() {
    await fetch(`/api/audits/${id}/book`, { method: "POST" }).catch(() => undefined);
    setDone(true);
    window.open(bookingUrl, "_blank", "noopener");
  }
  return done ? (
    <p>Otworzyliśmy kalendarz w nowej karcie. Jeśli się nie otworzył, <a href={bookingUrl} target="_blank" rel="noopener">kliknij tutaj</a>.</p>
  ) : (
    <button className="btn" onClick={book}>Umów bezpłatną konsultację</button>
  );
}
