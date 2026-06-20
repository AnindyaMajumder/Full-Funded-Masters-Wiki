# IP Paris PhD Track — ground truth (source 1)

NOTE ON METHOD: Direct crawl via `.venv/bin/crwl` failed — the host
`www.ip-paris.fr` (141.94.29.222) is unreachable from this sandbox (TCP connect
timeout; IPv6 route unreachable). WebFetch (server-side) repeatedly timed out
(>60s) on this domain. Ground truth below was therefore gathered via
domain-restricted WebSearch (allowed_domains: ip-paris.fr), which returns
verbatim text extracted from the official ip-paris.fr pages. crawlOk = false.

## Official PhD Track page
URL: https://www.ip-paris.fr/en/education/graduate-programs/phd-track
(Candidate URL https://www.ip-paris.fr/en/education/phd-track resolves to the
same PhD Track program; the canonical graduate-programs path is the current one.)

Verbatim (from official ip-paris.fr search snippets):

- "The PhD Track is a five-year program offering training in top-level research to
  high-potential students aiming for an international career in leading academic
  institutions or companies."
- "Applicants must be fluent in English, have an excellent academic background and
  wish to become researchers. Applicants can choose from 12 different tracks:
  Advanced Materials, Bioengineering and Quantitative Life Sciences, Chemistry and
  Interfaces, Computer Science, Data & Artificial Intelligence, Economics,
  Electrical Engineering, Energy for Climate, Mathematics, Mechanics, Physics and
  Quantum Science and Technologies."

## Eligibility / nationality
URL: https://www.ip-paris.fr/en/education/useful-information/admissions

- "Admission to the PhD Track Program is open to candidates holding (or in the
  process of obtaining) a Bachelor's degree awarded by an institution equivalent to
  Institut Polytechnique de Paris, in France or abroad."
- "Candidates for the PhD Track program must hold a Bachelor's degree (or
  equivalent) to enter the program at the M1 level and a M1 certificate of
  completion (or equivalent – 180 ECTS + 60 ECTS completed) to enter the program at
  the M2 level."
- "The Institut Polytechnique de Paris offers a PhD training program open to the
  best national and international students, enabling them to work in cutting-edge
  research topics."
- "Institut Polytechnique de Paris welcomes young researchers from diverse
  backgrounds to its laboratories to work on their thesis research."
- (PhD programs page) "the doctoral school of the Institut Polytechnique de Paris is
  extremely open to international recruitment (currently, foreign doctoral students
  represent 45% of PhD students)."

## Language & GRE
URL: https://www.ip-paris.fr/en/education/useful-information/admissions

- "A certificate of proficiency in English (level B2) is required (TOEIC, IELTS,
  TOEFL, Cambridge ESOL), except for native speakers and students who previously
  studied in English."
- "GRE certificate should be joined to your application. For some specific tracks
  like Economics, a GRE certificate is strongly recommended to demonstrate the
  strength of quantitative skills."
- "All documents must be written in French or English, or accompanied by an
  official translation into one of these languages."
- "Recommendation letters are not mandatory to submit your file and have your
  application accepted. You still have to fill in the application file with two
  referees' e-mail address but they are not required to write an actual
  recommendation letter. The lack of recommendation letters will not be held
  against you by the application jury."
