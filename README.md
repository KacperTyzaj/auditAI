# AuditAI

Darmowy audyt procesów online dla małych i średnich firm. Klient odpowiada na pytania o to, jak pracuje jego firma,
a aplikacja pokazuje, co można zautomatyzować przy użyciu AI i ile to da godzin i złotówek miesięcznie.
Każdy wypełniony audyt trafia do panelu firmy jako lead z oceną i szkicem oferty.

## Co jest w środku

| Ścieżka | Co robi |
| --- | --- |
| `/` | Strona startowa z wezwaniem do audytu |
| `/audyt` | Formularz krok po kroku; AI dopytuje, gdy odpowiedź jest zbyt ogólna |
| `/raport/[id]` | Raport dla klienta: oszczędności, mapa „wpływ × wysiłek”, 5 rekomendacji, przycisk konsultacji |
| `/panel` | Lista leadów (chroniona hasłem `PANEL_PASSWORD`) |
| `/panel/[id]` | Brief leada: kontakt, plany, wartość projektu, „jak zacząć rozmowę”, słowa klienta |

Najważniejsze pliki:

- `src/lib/catalog.ts` – katalog automatyzacji (udział pracy przejmowanej przez AI, wysiłek, ceny). **Podmień go na swoje usługi i cennik.**
- `src/lib/scoring.ts` – liczenie oszczędności i oceny leada. Liczby pochodzą tylko z odpowiedzi i katalogu, AI ich nie wymyśla.
- `src/lib/ai.ts` – wywołania Claude API: pytanie doprecyzowujące i teksty do raportu. Bez klucza API działają gotowe teksty.
- `src/lib/store.ts` – zapis audytów do plików JSON w `./data` (tylko do rozwoju; na produkcji zastąpimy bazą danych).

Wzór na oszczędność zadania: `godziny obszaru/tydz. × 4,33 ÷ liczba zaznaczonych zadań × udział automatyzacji × stawka godzinowa`.

## Uruchomienie lokalnie

Wymagany Node.js 20 lub nowszy.

```bash
npm install
cp .env.example .env.local   # uzupełnij hasło do panelu i (opcjonalnie) klucz ANTHROPIC_API_KEY
npm run dev                  # http://localhost:3000
```

Testy i sprawdzenie typów:

```bash
npm test
npm run lint
```

## Co dalej

1. Baza danych i logowanie do panelu (Supabase, region UE) zamiast plików JSON i hasła.
2. E-mail: kod weryfikacyjny, raport PDF dla klienta, powiadomienie o nowym leadzie.
3. Kalendarz konsultacji (Cal.com lub Calendly) i integracja z CRM.
4. Polityka prywatności, zgody RODO, limit audytów na adres e-mail.
5. Deploy na Vercel w regionie UE.
