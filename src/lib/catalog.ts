import type { AreaId, CatalogArea, CatalogTask, Effort } from "./types";

/**
 * Katalog automatyzacji. Udziały, czasy i ceny to przykładowe wartości:
 * podmień je na swoje usługi i cennik. AI nie wymyśla liczb, tylko korzysta z tej listy.
 */
export const CATALOG: CatalogArea[] = [
  {
    id: "obsluga",
    name: "Obsługa klienta",
    desc: "Pytania, maile, telefony, wizyty",
    ask: "Ile zapytań od klientów dostajecie dziennie i jakimi kanałami?",
    tasks: [
      { id: "chatbot", label: "Chatbot na stronie i WhatsApp odpowiadający na częste pytania", share: 0.6, effort: 1, price: [3000, 8000] },
      { id: "maile", label: "Automatyczne szkice odpowiedzi na maile", share: 0.5, effort: 1, price: [2000, 6000] },
      { id: "wizyty", label: "Umawianie wizyt i przypomnienia SMS", share: 0.7, effort: 1, price: [2000, 5000] },
    ],
  },
  {
    id: "sprzedaz",
    name: "Sprzedaż",
    desc: "Zapytania, oferty, CRM",
    ask: "Ile czasu zajmuje przygotowanie jednej oferty i ile ofert robicie w miesiącu?",
    tasks: [
      { id: "leady", label: "Kwalifikacja i ocena zapytań ofertowych", share: 0.5, effort: 2, price: [4000, 10000] },
      { id: "oferty", label: "Generowanie ofert i wycen z szablonu", share: 0.6, effort: 2, price: [5000, 12000] },
      { id: "crm", label: "Automatyczne uzupełnianie CRM i follow-upy", share: 0.6, effort: 1, price: [3000, 8000] },
    ],
  },
  {
    id: "dokumenty",
    name: "Dokumenty i back-office",
    desc: "Faktury, umowy, przepisywanie danych",
    ask: "Ile dokumentów miesięcznie trzeba ręcznie przepisać lub opisać?",
    tasks: [
      { id: "ocr", label: "Odczyt faktur i dokumentów (OCR + AI)", share: 0.7, effort: 2, price: [5000, 15000] },
      { id: "przepisywanie", label: "Przenoszenie danych między systemami", share: 0.8, effort: 2, price: [4000, 12000] },
      { id: "archiwum", label: "Archiwizacja i wyszukiwarka dokumentów", share: 0.5, effort: 2, price: [4000, 10000] },
    ],
  },
  {
    id: "finanse",
    name: "Finanse",
    desc: "Koszty, płatności, raporty",
    ask: "Jak dziś pilnujecie terminów płatności od klientów?",
    tasks: [
      { id: "ksiegowanie", label: "Opisywanie i dekretacja kosztów", share: 0.6, effort: 2, price: [5000, 12000] },
      { id: "windykacja", label: "Przypomnienia o płatnościach i windykacja miękka", share: 0.8, effort: 1, price: [2000, 5000] },
      { id: "raporty_fin", label: "Cykliczne raporty finansowe", share: 0.7, effort: 2, price: [3000, 8000] },
    ],
  },
  {
    id: "marketing",
    name: "Marketing",
    desc: "Treści, social media, newsletter",
    ask: "Kto dziś tworzy treści i ile godzin tygodniowo na to idzie?",
    tasks: [
      { id: "tresci", label: "Tworzenie treści i postów z pomocą AI", share: 0.5, effort: 1, price: [2000, 6000] },
      { id: "newsletter", label: "Newslettery i kampanie mailowe", share: 0.6, effort: 1, price: [2000, 5000] },
      { id: "analityka", label: "Raport z wyników kampanii", share: 0.7, effort: 2, price: [3000, 7000] },
    ],
  },
  {
    id: "zarzadzanie",
    name: "Zarządzanie i raporty",
    desc: "Zestawienia, spotkania, kontrola",
    ask: "Jakie zestawienia przygotowujecie ręcznie co tydzień lub co miesiąc?",
    tasks: [
      { id: "dashboard", label: "Dashboard z kluczowymi danymi firmy", share: 0.6, effort: 3, price: [5000, 15000] },
      { id: "spotkania", label: "Notatki i zadania ze spotkań", share: 0.7, effort: 1, price: [1500, 4000] },
    ],
  },
  {
    id: "hr",
    name: "HR i rekrutacja",
    desc: "CV, onboarding, pytania pracowników",
    ask: "Ile CV przeglądacie przy jednej rekrutacji?",
    tasks: [
      { id: "cv", label: "Wstępna selekcja CV", share: 0.6, effort: 2, price: [3000, 8000] },
      { id: "onboarding", label: "Onboarding i baza wiedzy dla pracowników", share: 0.5, effort: 2, price: [4000, 10000] },
    ],
  },
  {
    id: "zamowienia",
    name: "Zamówienia i logistyka",
    desc: "Zamówienia, statusy, stany",
    ask: "Skąd przychodzą zamówienia i kto je wprowadza do systemu?",
    tasks: [
      { id: "zamowienia", label: "Przyjmowanie zamówień z maili i formularzy", share: 0.7, effort: 2, price: [5000, 12000] },
      { id: "statusy", label: "Automatyczne statusy zamówień dla klientów", share: 0.8, effort: 1, price: [2000, 6000] },
    ],
  },
];

export const AREA_IDS = CATALOG.map((a) => a.id);

export function getArea(id: AreaId): CatalogArea {
  const area = CATALOG.find((a) => a.id === id);
  if (!area) throw new Error(`Nieznany obszar: ${id}`);
  return area;
}

export function getTask(area: AreaId, taskId: string): CatalogTask | undefined {
  return getArea(area).tasks.find((t) => t.id === taskId);
}

export const EFFORT_LABELS: Record<Effort, { name: string; tone: "easy" | "mid" | "hard"; duration: string }> = {
  1: { name: "Szybkie wdrożenie", tone: "easy", duration: "1–2 tyg." },
  2: { name: "Średni projekt", tone: "mid", duration: "3–6 tyg." },
  3: { name: "Większy projekt", tone: "hard", duration: "6–10 tyg." },
};

export const INDUSTRIES = [
  "Biuro rachunkowe",
  "E-commerce",
  "Usługi lokalne",
  "Nieruchomości",
  "Spedycja i logistyka",
  "Budownictwo i instalacje",
  "Produkcja",
  "Inna",
];

export const SIZES = ["1–9", "10–49", "50–249", "250+"];

export const WHEN_LABELS = { "1": "W ciągu miesiąca", "3": "W ciągu 3 miesięcy", "6": "Za pół roku lub później", "?": "Jeszcze nie wiem" } as const;
export const BUDGET_LABELS = { "1": "Do 5 tys. zł", "5": "5–20 tys. zł", "20": "20–50 tys. zł", "50": "Powyżej 50 tys. zł", "?": "Nie wiem" } as const;
export const DECIDER_LABELS = { ja: "Ja", wspolnicy: "Ja ze wspólnikami", zarzad: "Zarząd lub właściciel" } as const;
