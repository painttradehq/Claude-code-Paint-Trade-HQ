# 04 — Employment documents (the Contracts feature)

How the app handles employment agreements and related documents between a painting business and its crew. Built September 2026 (Round 22). Pulled from the specification and the code on 6 October 2026.

## 1. Ground rules the feature is built on

1. **No legal advice from the app.** The app never ships contract wording. Every template screen shows this notice: *"Your document, your responsibility. Paint Trade HQ fills in the fields, collects signatures and keeps the record. It does not give legal advice. Have the wording checked by a lawyer or Fair Work, and keep it in line with the award and the National Employment Standards."* The employment template adds: *"For employment agreements, the free Employment Contract Tool on business.gov.au produces award-based wording you can paste here."*
2. **Electronic signature record.** For every signature the app stores the exact document text as signed (frozen per issued document), the signer, the timestamp (UTC, shown in the business time zone), the IP address, the method (typed or drawn) and the template version. The crew member always receives a copy.
3. **Nothing signed is ever edited or hard-deleted.** Issued documents are append-only apart from status changes, the countersignature, the "also given" checklist and audit entries. "Withdraw" exists only before signing and keeps the record.
4. **Ending employment is recorded, not performed.** "Record the end" stores a date and a note and shows: *"This only records the end in the app. Notice periods, final pay and unfair-dismissal rules apply separately under the Fair Work Act. The app does not send any letter."*
5. **Retention.** Issued documents, signatures and PDFs are kept for at least seven years and treated as records, not app data, by any purge or export.
6. **Signature images are private** — never on a public link.
7. **Unfilled placeholders stay visible** (highlighted) to the admin before sending and to the crew member when signing; the app never silently blanks them.

## 2. Document types

Employment agreement · Confidentiality · Code of conduct · Safety agreement · Social media & photo consent · one "Other" the business names. One template per type per business, written by the business; saving makes a new version; documents already sent keep the version they were sent with.

## 3. Fields the app fills in

[EMPLOYEE FULL NAME] [EMPLOYEE ADDRESS] [POSITION] [EMPLOYMENT TYPE] (Casual / Part-time / Full-time) [AWARD CLASSIFICATION] [START DATE] [OFFER DATE] [HOURLY RATE] [CASUAL LOADING] (default 25%) [ORDINARY HOURS] [NOTICE PERIOD] [BUSINESS NAME] [ABN] [BUSINESS ADDRESS] [DATE SIGNED]. Hints shown to the business: "From the Fair Work pay guide for your award." and "Must be at or above the award rate for the classification."

## 4. Flow

1. The business issues one or more documents to a crew member; the crew member is emailed and sees them in the crew app.
2. The crew member reads the filled document, signs (draw or type) and can ask a question (goes to the owner).
3. The business countersigns by typing the owner's full name exactly.
4. The app renders a signed PDF (filled text, then a signature block with crew name, method, time, IP; business signer and time; footer "Template v{n} · Document {ID} · Paint Trade HQ record"), emails it to the crew member and the owner, and stores it privately on the employee record.
5. **"Also given" checklist** on employment documents, with links to the official copies: Fair Work Information Statement; Casual Employment Information Statement (casual only); Superannuation standard choice form; Tax file number declaration. The business ticks each with a date.
6. Replace with a new version (old becomes superseded once the new one is countersigned); Record the end; Withdraw before signing.

## 5. Crew app and crew data

- Crew members sign in to a separate employee web app with a QR onboarding link from their employer.
- The onboarding wizard collects: name, phone, email, address, emergency contact, date of birth, licences and qualifications with uploaded copies (15 MB cap per file), bank and super details if the business asks for them, a profile photo. **The wizard sets an "agreed to terms" flag automatically; crew members are not shown Paint Trade HQ's Terms or Privacy Policy.**
- Crew members can be 15 or older (Terms §2); Privacy §10 says 15 to 17 need the employer to have guardian consent where required.
- Sign-in/sign-out on a job records time and, if the phone allows, GPS position and distance from the job site; sign-ins outside the job's geofence radius are flagged "off-site" with the distance. Location is not tracked between sign-in and sign-out.
- Staff documents (licences, IDs, contracts) are visible only to the business's admin users and to the staff member concerned; never on a public link.
- Timesheets, leave, strikes and recognition notes, training progress, equipment issued and performance ratings (1–10 with a 90-day score) are kept by the business.
