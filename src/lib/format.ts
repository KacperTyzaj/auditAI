export const zl = (n: number) => `${Math.round(n).toLocaleString("pl-PL")} zł`;
export const num = (n: number) => Math.round(n).toLocaleString("pl-PL");
export const hrs = (n: number) => `${num(n)} h`;
export const zlRange = (a: number, b: number) => `${num(a)}–${zl(b)}`;

export const SCORE_LABELS = { hot: "Gorący", warm: "Ciepły", cold: "Zimny" } as const;
