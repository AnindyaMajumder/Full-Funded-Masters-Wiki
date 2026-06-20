# ADISURC Campania Right-to-Study Scholarship (Borsa di studio) — official ground truth

Source program: A.Di.S.U.R.C. (Azienda per il Diritto allo Studio Universitario della Regione Campania)
Official site: https://www.adisurcampania.it
Official 2025/2026 bando (Italian): https://www.adisurcampania.it/sites/default/files/2025-08/Bando%20di%20Concorso%20a.a.%202025.26.pdf
Official 2025/2026 bando (English): https://www.adisurcampania.it/sites/default/files/2025-08/Bando%20di%20Concorso%20a.a.%202025.26_ENG_0.pdf
Official approval news: https://www.adisurcampania.it/notizie/approvazione-bando-di-concorso-20252026

NOTE ON CRAWL: The adisurcampania.it file/CDN host repeatedly timed out for crwl,
curl, urllib and WebFetch from this environment (Errno 110 connection timed out on
the PDF; Drupal news pages rendered empty via headless browser). Ground truth below
was obtained from (a) WebSearch returning verbatim text from the official ADISURC
2025/2026 bando + approval news, and (b) the binding regional legal framework saved
in __2.md (Regione Campania BURC, "Programmazione annuale degli interventi per il
diritto allo studio universitario", which ADISURC implements verbatim). crawlOk:false.

## DEADLINE (official ADISURC 2025/2026 bando + approval news)
VERBATIM: "La scadenza del concorso è fissata alle ore 12:00 del giorno 18 settembre 2025."
(deadline 12:00 noon, 18 September 2025) — academic year 2025/2026.

## ELIGIBILITY — FOREIGN / NON-EU / DEVELOPING-COUNTRY STUDENTS (incl. Bangladesh)
Regional framework (__2.md, art. 9.3, BURC):
VERBATIM: "L'art. 8, comma 3, del decreto legislativo 29 marzo 2012, n.68, disciplina
anche la condizione economica degli studenti stranieri e degli studenti italiani
residenti all'estero definita attraverso l'Indicatore della situazione economica
equivalente all'estero, calcolato come la somma dei redditi percepiti all'estero e del
20 per cento dei patrimoni posseduti all'estero..."

Developing-country students explicitly recognised (__2.md, art. 2.4, BURC):
VERBATIM: "Alla prima categoria appartengono anche gli apolidi, i rifugiati politici e
gli studenti provenienti dai paesi in via di sviluppo, i paesi in stato di belligeranza
nonché gli studenti stranieri provenienti dai Paesi particolarmente poveri in relazione
alla presenza di un Basso Indicatore di Sviluppo Umano se in possesso del solo requisito
di merito richiesto per accedere ai concorsi a benefici a domanda individuale."

ISEE parificato for foreign students (official ADISURC bando, via WebSearch):
VERBATIM: "Gli studenti stranieri dovranno dotarsi di Attestazione ISEE parificato,
rilasciata da uno dei Centri di Assistenza Fiscale italiani."
VERBATIM: "Il pagamento dell'eventuale borsa di studio è sospeso fino alla consegna
dell'ISEE UNIVERSITARIO PARIFICATO (ISEEUP)."
(Bangladesh is a developing country with a low/medium HDI — not excluded; foreign
non-EU students apply by obtaining an ISEE parificato. No closed bilateral country list.)

## ECONOMIC REQUIREMENTS (official bando + regional framework art. 9.4)
VERBATIM (__2.md, art. 9.4): "Per l'accesso alle borse di studio, l'ISEE del nucleo
familiare, sommato con l'Indicatore della situazione economica all'estero, non può
superare il limite di € 25.500,00. Sono esclusi dai benefici ... gli studenti per i
quali l'Indicatore della situazione patrimoniale familiare equivalente superi il limite
di € 54.000,00."
=> ISEE ≤ €25,500 AND ISPE ≤ €54,000.

## MERIT REQUIREMENT (official ADISURC 2025/2026 bando, via WebSearch)
VERBATIM: "I candidati che conseguono almeno 20 CFU entro il termine del 30/11/2026
hanno diritto a ricevere il 100% della borsa di studio assegnata in graduatoria e a
usufruire dei benefici ad essa connessi se conseguono almeno 20 CFU entro il termine
del 30/11/2026."
Master's (laurea magistrale) first-year, regional framework (__2.md art. 9.10):
first instalment requires "riconoscimento di almeno 150 crediti"; then "20 crediti"
by 10 August for the next instalment.

## BENEFITS — WHAT IT COVERS
1) Cash scholarship — Table 1 (__2.md, art. 7.3, BURC), annual amounts by residence status:
   VERBATIM table values (ISEE = soglia €25,500 / down to ½ soglia €12,750):
   "FUORI SEDE" €4,490.00 → €8,068.37 ; "PENDOLARE" €2,345.00 → €4,715.06 ;
   "IN SEDE" €1,430.00 → €3,251.79.
   +15% for ISEE below half the maximum (art. 7.2); +20% for female STEM students (art. 7.4).
2) Regional DSU tax exemption / reduced tuition tax — regional tax (tassa regionale DSU)
   reduced to lowest bracket €125.50 for scholarship-eligible & developing-country students
   (__2.md art. on tassa regionale): VERBATIM "125,50 euro per coloro che presentano un
   valore ISEEU inferiore o pari a quello previsto dai requisiti di eleggibilità per
   l'accesso alle borse di studio (ISEEU < 25.500,00 euro) e per gli studenti appartenenti
   ai Paesi in via di sviluppo ex art. 13 comma 5 DPCM 9 aprile 2001". National regional
   right-to-study scholarship winners are also exempt from the regional DSU tax and from the
   university "contributo onnicomprensivo" tuition contribution (esonero, art. 7.9).
3) Free / subsidised canteen meals — VERBATIM (__2.md art. 7.5): "Per gli studenti in sede
   alla borsa di studio definita secondo la tabella 1 si aggiunge la fruizione di un pasto
   giornaliero gratuito su base annua." Developing-country students are first-category for
   canteen: "€2,50 per pasto tradizionale e €2,00 per pasto alternativo" (art. 2.5).
   Eligible-but-unfunded students get free canteen (art. 7.6).
4) Accommodation / housing — fuori-sede scholarship winners get a residence place;
   housing tariff applies/deducted (__2.md arts. 2.10, 4.6, 6.3).
5) International mobility top-up — €600/month contribution (approval news):
   VERBATIM (approval news, via WebSearch): "an integration of the scholarship for
   participation in international mobility programs for a total contribution of €600.00
   per month."

## APPLICATION / REQUIRED DOCUMENTS
VERBATIM (approval news, via WebSearch): "Applications must be submitted exclusively
online through the official website by accessing the RESERVED STUDENT AREA using SPID/CIE
(for adult students of Italian nationality) or credentials obtained during accreditation
(for minor students and/or foreign nationals)..."
Required: online application via reserved student area (accreditation credentials for
foreign nationals); ISEE / ISEE parificato (ISEEUP) attestation for foreign students
(from a convenzionato CAF, free); for ISEE parificato, foreign students must declare
the family nucleus and each member's gross income earned abroad in 2023 plus documents
on family income/assets abroad; DSU (Dichiarazione Sostitutiva Unica, Mod. MB.2) for the
ISEE; enrolment/admission to a Campania university; merit self-certification.
VERBATIM (WebSearch on ISEE parificato): "Per il calcolo dell'ISEE parificato, è
necessario specificare il nucleo familiare d'origine e l'attività lavorativa con i
relativi redditi lordi percepiti all'estero da ciascun componente della famiglia
nell'anno 2023."

## HOST
Region Campania, Italy. Universities adhering to ADISURC DSU: Università di Napoli
Federico II, L'Orientale, Vanvitelli, Parthenope, Salerno (UNISA), Sannio (Benevento),
plus AFAM institutions in Campania.

## MUST-KNOW
- Means-tested regional right-to-study (DSU) grant, NOT a merit/excellence award; you
  must be low-income (ISEE ≤ €25,500, ISPE ≤ €54,000) AND already admitted/enrolled at a
  Campania university — it is not an admission scholarship.
- Foreign non-EU students MUST obtain an ISEE parificato (ISEEUP) from an Italian CAF using
  documents proving 2023 family income/assets abroad; scholarship payment is suspended until
  the ISEEUP is delivered.
- Amount depends on residence status (in sede / pendolare / fuori sede) and ISEE band;
  fuori-sede (living away, ≥30 km) receive the most plus a housing place.
- First-year master's: 150 credits recognised at enrolment; keep funding by earning
  ≥20 CFU by 30/11/2026 (full grant) — failing the credit threshold revokes/halves it.
- Ranking-list / available-funds basis: being "idoneo" (eligible) does not guarantee
  payment if regional funds run out (but eligible-unfunded still get free canteen).
- Italian-taught environment in practice; no IELTS/GRE required by ADISURC (it funds, the
  university handles admission/language).
