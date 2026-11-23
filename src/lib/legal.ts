/* Legal documents shown on /terms and /privacy.
   Text is copied word for word from the business's documents:
   - Spinning_Top_Updated_Terms_of_Service.docx
   - Spinning_Top_Updated_Privacy_Policy.pdf
   Business details were filled in for publication (23 November 2026). Any
   new [BRACKETED] text would be highlighted on the page as a placeholder. */

export type LegalBlock = { type: "p"; text: string } | { type: "ul"; items: string[] };

export type LegalSection = { heading: string; blocks: LegalBlock[] };

export type LegalDoc = {
  title: string;
  subtitle: string;
  draftNote: string;
  meta: string[];
  sections: LegalSection[];
  /** Last section: label/value pairs. */
  contact: { heading: string; intro?: string; rows: [label: string, value: string][] };
};

const p = (text: string): LegalBlock => ({ type: "p", text });
const ul = (...items: string[]): LegalBlock => ({ type: "ul", items });

export const LEGAL_TAGLINE = "Better Care. Easier Living. Brighter Futures.";

const LEGAL_ENTITY = "SPINNING TOP DRYCLEANERS AND LAUNDERERS LIMITED";
const ADDRESS = "Estate, House of VKY, Extension, opposite Valencia School Junction, beside TAP Studio, Oluyole, Ibadan 223222, Oyo State, Nigeria";
const EMAIL = "admin@spinningtop.ng";
const PHONE = "+234 803 830 2674";
const EFFECTIVE = "Effective date: 23 November 2026";

/* ── Terms of Service ─────────────────────────────────────────────────── */

export const TERMS: LegalDoc = {
  title: "Website Terms of Service",
  subtitle: "Customer transactions • services • product shop • training academy",
  draftNote: "",
  meta: ["Website: www.spinningtop.ng", EFFECTIVE, "Version: 1.0"],
  sections: [
    {
      heading: "1. About these Terms",
      blocks: [
        p(
          `These Terms of Service ("Terms") govern access to www.spinningtop.ng (the "Website") and orders, bookings, purchases, training enrolments and other transactions with Spinning Top Drycleaners & Launderers ("Spinning Top", "we", "our" or "us"). The contracting supplier is ${LEGAL_ENTITY}, trading as Spinning Top Drycleaners & Launderers, with its principal business address at ${ADDRESS}.`,
        ),
        p(
          "Please read these Terms and the applicable quotation, order confirmation, service description and any specific policy shown at checkout or enrolment. By placing an order that we accept, you agree to the terms applicable to that transaction. Merely browsing the Website does not create a service contract.",
        ),
        p(
          'Nothing in these Terms limits rights or remedies that cannot lawfully be excluded under the Federal Competition and Consumer Protection Act 2018 ("FCCPA") or other applicable Nigerian law.',
        ),
      ],
    },
    {
      heading: "2. Our services and service availability",
      blocks: [
        p("Spinning Top operates across the following service categories, subject to availability by location and any applicable regulatory approvals:"),
        ul(
          "Laundry; wet cleaning and dry cleaning; professional pressing and finishing.",
          "Tailoring, garment repairs and alterations; shoe repair and cobbler services.",
          "Upholstery, rug and carpet cleaning; janitorial and facilities cleaning; pest control or fumigation where duly authorised.",
          "Sales of laundry, hygiene and household products and related equipment.",
          "Training Academy courses, workshops, practical instruction and related learning materials.",
        ),
        p(
          "Pickup and delivery, express services and corporate contracts are offered only when expressly confirmed. Website descriptions are general information and do not guarantee that every service or product is available at every location.",
        ),
      ],
    },
    {
      heading: "3. Booking, acceptance and order records",
      blocks: [
        p(
          "A request for a booking, quotation or enrolment is an offer to transact and is subject to confirmation. A binding order is formed only when Spinning Top accepts it by an order confirmation or other clear communication specifying the agreed service or product, price (or pricing basis) and material terms.",
        ),
        p(
          "We may request photographs, measurements, care labels, inspection access or other information reasonably necessary to assess the job. We will explain material limitations, changes to the scope or price, and expected timelines before seeking authorisation to proceed.",
        ),
        p(
          "You are responsible for supplying accurate contact details, item descriptions, safe access instructions and, where relevant, collection and delivery addresses. We will maintain a transaction record or receipt as required by applicable law.",
        ),
      ],
    },
    {
      heading: "4. Inspection, processing and garment-care risks",
      blocks: [
        p(
          "Before treatment we may count, label and inspect entrusted items, including for visible stains, tears, colour instability, worn fabric, loose trims, previous repairs and care-label instructions. Please disclose known weaknesses, unusual finishes, past dye treatments, valuables left in pockets and any special care requirements.",
        ),
        p(
          "We will use reasonable professional skill, care and diligence and, where practicable, tell you about material risks identified during inspection. Not every stain can be removed, and some pre-existing defects or latent material weaknesses may affect the outcome. No result is guaranteed unless expressly agreed in writing.",
        ),
        p(
          "These practical limitations do not excuse negligent handling, defective services, failure to exercise reasonable care or failure to return customer property in the condition required by law. No inspection acknowledgement amounts to a blanket waiver of your statutory rights.",
        ),
      ],
    },
    {
      heading: "5. Tailoring, shoe repairs, upholstery and other assessed work",
      blocks: [
        p(
          "Tailoring, footwear restoration, upholstery and rug work may require inspection and a written or recorded quotation. We will communicate the intended method, reasonable limitations, price and estimated completion date before starting the agreed work.",
        ),
        p(
          "If inspection reveals a material change to the job, we will seek your approval before performing additional chargeable work. Some repairs or cleaning treatments cannot restore an item to its original appearance, colour, strength or condition; any significant limitation identified in advance will be explained.",
        ),
      ],
    },
    {
      heading: "6. Janitorial, pest-control and on-site services",
      blocks: [
        p(
          "On-site services are governed by the agreed statement of work, site requirements, quoted price, dates and safety arrangements. Customers should disclose access restrictions, known hazards, relevant building rules and any material concerns about delicate surfaces or furnishings.",
        ),
        p(
          "Pest control and fumigation are provided only within the approved scope and applicable licensing, environmental and safety requirements. Customers must follow reasonable preparation, exclusion, ventilation and re-entry instructions provided for a treatment. We do not promise a pest-free outcome where reinfestation or other conditions are outside the agreed treatment scope.",
        ),
        p("Any change to on-site scope or additional charge requires approval before the extra work is undertaken."),
      ],
    },
    {
      heading: "7. Pickup, delivery and uncollected items",
      blocks: [
        p(
          "Where available, pickup and delivery arrangements, fees and time windows will be confirmed before the order proceeds. Collection or delivery times are estimates unless expressly guaranteed. We will communicate significant delays in a timely manner.",
        ),
        p(
          "Please check the item count on handover and report a missing or damaged item as soon as reasonably practicable. Late notification will not automatically extinguish statutory rights.",
        ),
        p(
          "If an order remains uncollected, we will attempt to notify the customer using the supplied contact details. Any lawful storage charge or eventual handling of unclaimed property must be separately notified and must comply with applicable law; these Terms do not grant an automatic right to dispose of customer property.",
        ),
      ],
    },
    {
      heading: "8. Prices, quotations, taxes and payments",
      blocks: [
        p(
          "Before accepting payment, we will disclose the applicable price or agreed calculation method, taxes where applicable, additional service charges, delivery charges and any deposit requirement. A revised charge for materially different work will not apply without your consent.",
        ),
        p(
          "Payments may be made only using payment methods presented by Spinning Top at the relevant time. Payments processed by independent gateways may also be subject to those providers' terms, but this does not diminish our own responsibilities to you.",
        ),
        p(
          "A valid receipt, invoice or confirmation will be made available in line with applicable law. Promotional prices apply subject to clearly stated eligibility criteria and dates.",
        ),
      ],
    },
    {
      heading: "9. Advance bookings, changes and cancellations",
      blocks: [
        p(
          "You may request cancellation of an advance booking, reservation or order. Under section 120 of the FCCPA, a reasonable cancellation charge may apply in appropriate circumstances, assessed against factors including the nature of the booking, the notice given, work or resources committed and the ability to reallocate the booking.",
        ),
        p(
          "No cancellation charge will be imposed where prohibited by law, including where the customer cannot honour a booking due to the death or hospitalisation of the person for whose benefit it was made, as contemplated by section 120(3) of the FCCPA.",
        ),
        p(
          "For work already begun with your authority, you may be responsible for properly performed work and reasonable, lawful costs incurred. Any booking-specific cancellation condition will be presented before confirmation. If we cancel or cannot provide an agreed paid service, we will offer the remedy required by law, including a refund where applicable.",
        ),
      ],
    },
    {
      heading: "10. Product sales, returns and statutory guarantees",
      blocks: [
        p(
          "Product listings will describe the goods, prices and material conditions as accurately as reasonably possible. Product safety warnings, ingredient labels and directions supplied with cleaning or hygiene products must be followed.",
        ),
        p(
          "Your rights to return unsuitable or defective goods, and to receive applicable statutory remedies, are preserved. In particular, section 132 of the FCCPA provides an implied warranty of quality and a three-month post-delivery remedy for goods that fail the applicable statutory standards, subject to the conditions of that section. Those remedies may include repair, replacement or refund.",
        ),
        p(
          'Any separate change-of-mind or voluntary return programme will be described at checkout and applies in addition to statutory rights. We do not enforce a blanket "no refunds" policy in derogation of Nigerian law.',
        ),
      ],
    },
    {
      heading: "11. Complaints, lost items and defective services",
      blocks: [
        p(
          `If an item is lost, damaged, returned incorrectly or processed defectively, or if any product or service causes concern, contact us by email at ${EMAIL} or by phone/WhatsApp on ${PHONE} with the order reference and available evidence. We will acknowledge the complaint, review inspection and order records, and communicate a reasoned response.`,
        ),
        p(
          "Where Spinning Top fails to meet applicable legal service standards, available remedies may include re-performance, correction, replacement, refund or other compensation as required by law and supported by the circumstances. We will not impose an arbitrary claims deadline that removes statutory rights.",
        ),
        p(
          "Disputes about value or the condition of property will be assessed fairly, taking into account appropriate evidence and relevant legal requirements. A customer may also contact the appropriate regulator or pursue a lawful dispute-resolution process.",
        ),
      ],
    },
    {
      heading: "12. Training Academy enrolment",
      blocks: [
        p(
          "Academy course pages or enrolment materials will state the curriculum or outline, fee, duration, delivery method, assessment criteria, required equipment, entry requirements and nature of any certificate offered.",
        ),
        p(
          "Enrolment is confirmed only when accepted and any applicable payment requirement is met. Course transfers, withdrawals, cancellations and refunds will follow the specific Academy terms disclosed before enrolment, together with mandatory consumer rights. If Spinning Top cancels a course, affected students will be notified and offered an appropriate lawful remedy.",
        ),
        p(
          "Participants must comply with reasonable safety, attendance, conduct and assessment rules. Completion of training does not guarantee employment, business profitability or accreditation by an external authority unless expressly and verifiably represented.",
        ),
      ],
    },
    {
      heading: "13. Corporate and institutional contracts",
      blocks: [
        p(
          "Hotels, schools, hospitals, estates, offices and other organisations may enter into separate quotations, service-level agreements or written contracts. In the event of conflict, a signed and applicable corporate agreement takes precedence for that transaction, except where mandatory law requires otherwise.",
        ),
        p(
          "Any processing of personal information on behalf of a corporate customer may require a separate data-processing arrangement and appropriate confidentiality and security obligations.",
        ),
      ],
    },
    {
      heading: "14. Customer responsibilities and prohibited use",
      blocks: [
        p(
          "You must use the Website lawfully, provide accurate information, respect legitimate safety instructions, disclose known hazards relevant to on-site work and refrain from fraud, impersonation, abusive behaviour or interference with our systems.",
        ),
        p("Nothing in this clause transfers to customers responsibilities that Nigerian law imposes on Spinning Top."),
      ],
    },
    {
      heading: "15. Intellectual property and third-party links",
      blocks: [
        p(
          "Spinning Top's original brand materials, approved logo, Website content, course materials and other protected works may not be used commercially without permission, except as permitted by law. Links to third-party sites are provided for convenience and are governed by their own terms and privacy notices.",
        ),
      ],
    },
    {
      heading: "16. Privacy and communications",
      blocks: [
        p(
          "Our separate Privacy Policy explains how personal information is handled when you request services, purchase products, enrol in training or use the Website. Transactional service messages may be necessary to perform your order. Optional marketing is subject to the applicable consent and opt-out requirements.",
        ),
      ],
    },
    {
      heading: "17. Liability and statutory rights",
      blocks: [
        p(
          "We do not exclude or limit liability for fraud, negligence, defective service, violation of mandatory consumer rights or any liability that cannot lawfully be excluded. Neither an inspection note nor a service disclaimer removes these protections.",
        ),
        p(
          "Circumstances outside our reasonable control may affect scheduling or performance. If this happens, we will communicate material impacts and fulfil any applicable duty to provide a remedy.",
        ),
      ],
    },
    {
      heading: "18. Changes to these Terms",
      blocks: [
        p(
          "We may amend these Terms to reflect changes in services, technology or law. The version and effective date will be shown on the Website. Updated Terms will apply to future transactions after publication; they will not retroactively strip customers of accrued legal rights. Material changes affecting an existing order will be handled in accordance with applicable law.",
        ),
      ],
    },
  ],
  contact: {
    heading: "19. Governing law and contact details",
    intro:
      "These Terms are governed by the applicable laws of the Federal Republic of Nigeria. We encourage good-faith complaint resolution in the first instance, but nothing in these Terms prevents a customer from contacting the Federal Competition and Consumer Protection Commission, another competent regulator or a court where legally entitled.",
    rows: [
      ["Trading name", "Spinning Top Drycleaners & Launderers"],
      ["Registered legal entity", LEGAL_ENTITY],
      ["Principal address", ADDRESS],
      ["Website", "https://www.spinningtop.ng"],
      ["Customer service email", EMAIL],
      ["Telephone / WhatsApp", PHONE],
    ],
  },
};

/* ── Privacy Policy ───────────────────────────────────────────────────── */

const PRIVACY_SOURCE: LegalDoc = {
  title: "Website Privacy Policy",
  subtitle: "Personal data • bookings • payments • Academy • cookies and rights",
  draftNote: "",
  meta: ["Website: www.spinningtop.ng", EFFECTIVE, "Version: 1.0"],
  sections: [
    {
      heading: "1. Who we are and scope of this notice",
      blocks: [
        p(
          'This Privacy Policy explains how Spinning Top Drycleaners & Launderers ("Spinning Top", "we", "us" or "our") collects and uses personal data when you visit spinningtop.ng, request laundry or cleaning services, buy products, use pickup and delivery, contact our team, enquire about corporate services or enrol in our Training Academy.',
        ),
        p(
          `The organisation responsible as data controller is ${LEGAL_ENTITY}, trading as Spinning Top Drycleaners & Launderers. Its principal address is ${ADDRESS}, and its data-protection contact is ${EMAIL}. If a separate corporate client determines why and how certain personal data is used, Spinning Top may act as a data processor under that arrangement.`,
        ),
        p(
          'This notice is intended to reflect the Nigeria Data Protection Act 2023 ("NDPA") and the Nigeria Data Protection Act General Application and Implementation Directive 2025 ("GAID").',
        ),
      ],
    },
    {
      heading: "2. Categories of personal data",
      blocks: [
        p("Depending on your interaction with us, we may collect:"),
        ul(
          "Identity and contact data: name, telephone number, email address, delivery or service address and relevant business contact information.",
          'Account data: if you create an account, your sign-in email, name and saved details (phone, address, newsletter choice). If you choose "Continue with Google", we receive your name, email address, profile picture and Google account identifier from Google (see "Signing in with Google" below).',
          "Bookings and service records: order history, item descriptions, fabric-care instructions, item or site photographs voluntarily supplied, inspection notes, service requests and delivery arrangements.",
          "Purchases and billing data: products ordered, payment confirmations, receipts, invoices, refund requests and transaction references. Full card details should be handled by the applicable payment gateway, not unnecessarily stored by us.",
          "Academy data: course applications, contact information, attendance, assessments, fees paid and certificates where applicable.",
          "Customer-support data: emails, WhatsApp messages, enquiries, feedback, testimonials and complaint records.",
          "Website technical data: IP address, device and browser information, security logs and, where enabled, cookies or similar tracking identifiers.",
        ),
        p(
          "Please avoid sharing sensitive personal data unless it is genuinely necessary and requested for a clearly explained purpose. We will provide an appropriate additional notice where a service requires information outside the categories above.",
        ),
      ],
    },
    {
      heading: "3. How we obtain information",
      blocks: [
        p(
          "We collect data directly from you when you fill in a form, contact us, book a service, purchase a product, pay an invoice, enrol in training or submit feedback. Technical information may be generated by interactions with the Website. We may also receive service-related information from a person who lawfully arranges a service on your behalf, or from an approved delivery, payment or corporate partner.",
        ),
      ],
    },
    {
      heading: "4. Why we process personal data and lawful bases",
      blocks: [
        p("We use personal data only for specified, lawful purposes, based on the circumstances of the activity:"),
        ul(
          "Booking, inspecting, processing and delivering services: performance of a contract or steps requested before entering into one.",
          "Completing product purchases, issuing invoices and payment confirmations: contract and, where applicable, legal obligation.",
          "Administering Training Academy programmes, attendance and certificates: contract and, where applicable, legal obligation.",
          "Meeting accounting, tax, regulatory and statutory recordkeeping duties: legal obligation.",
          "Investigating abuse, preventing fraud, securing systems and handling appropriate operational claims: legal obligation or assessed legitimate interests where permitted.",
          "Sending optional marketing, promotions and course announcements: your specific consent where required, including for direct marketing under the GAID.",
          "Operating non-essential website analytics or advertising tracking: consent where required by the GAID and the nature of the tool.",
        ),
        p(
          "Where we rely on legitimate interests, we will consider the necessity of the processing and its effects on your rights. We will not condition the provision of a necessary service on agreement to unrelated optional marketing.",
        ),
      ],
    },
    {
      heading: "5. When information is required",
      blocks: [
        p(
          "Some information - such as an accurate service address, order details and a way to contact you - is necessary to arrange or fulfil a transaction. If it is not provided, we may be unable to complete the relevant booking or delivery. Optional marketing preferences and non-essential tracking choices are not required to purchase services.",
        ),
      ],
    },
    {
      heading: "6. Cookies and similar technologies",
      blocks: [
        p(
          "The Website may use strictly necessary tools for core functionality such as security, network stability and accessibility. Any non-essential analytics, advertising or preference cookies will be identified to visitors and activated only where the required consent has been obtained.",
        ),
        p(
          "Where non-essential cookies or similar tools are deployed, the Website will provide a visible choice to accept or reject them, explain their purposes and allow visitors to withdraw or adjust applicable preferences.",
        ),
        p(
          "At present the Website uses only strictly necessary browser storage: to keep you signed in, and to remember your cart, wishlist, booking selection and recently viewed items on your device. We do not currently use analytics, advertising or social-media tracking tools (such as Google Analytics or Meta Pixel). This information stays in your browser until you sign out, clear it or it expires, and you can clear it at any time through your browser settings.",
        ),
      ],
    },
    {
      heading: "7. Payments, delivery and service providers",
      blocks: [
        p(
          "We may share the minimum personal data necessary with vetted service providers supporting payments, web hosting, order management, pickup and delivery, communications and Academy operations. The actual providers and their roles should be documented internally and reflected in this notice where appropriate.",
        ),
        p(
          "Current providers and their roles:",
        ),
        ul(
          "Paystack — online payments. Card and bank details are entered in Paystack's secure payment window and are not stored by us; we receive the payment confirmation and transaction reference.",
          "QServers — website hosting and our email server (order and booking emails are sent from noreply@spinningtop.ng).",
          "Supabase — secure database and sign-in service for accounts, orders, bookings and uploaded booking photos.",
          'Google — optional "Continue with Google" sign-in.',
          "Holt — delivery of orders you choose to have delivered (we share your name, phone number and delivery address). Kwik may be added as a delivery option in future.",
          "WhatsApp (Meta) — messaging, when you choose to contact us or we reply to you on WhatsApp.",
        ),
        p(
          "Where these providers handle personal data on our behalf, we will seek appropriate written contractual safeguards, confidentiality, security obligations and instructions. We do not sell personal data to advertisers.",
        ),
      ],
    },
    {
      heading: "8. Signing in with Google",
      blocks: [
        p(
          'You can create an account or sign in with "Continue with Google" instead of an email code. This is optional; you can always use your email address instead.',
        ),
        p("When you choose Google sign-in, Google shares the following with us, with your permission:"),
        ul("your name;", "your email address;", "your profile picture; and", "a Google account identifier that lets us recognise you the next time you sign in."),
        p(
          "We use this information only to create and secure your Spinning Top account, sign you in, fill in your name and email on orders and bookings, link earlier bookings made with the same email address, and send you messages about your orders, bookings and account. We do not access your Google contacts, files, emails, calendar or any other Google data, and we do not post anything to your Google account.",
        ),
        p(
          "We do not sell information received from Google, use it for advertising, or share it with anyone except the service providers listed above where needed to run your account (for example our database provider, Supabase). Spinning Top's use and transfer of information received from Google APIs adheres to the Google API Services User Data Policy, including the Limited Use requirements.",
        ),
        p(
          `You can stop using Google sign-in at any time by removing Spinning Top from your Google Account's third-party connections (https://myaccount.google.com/connections). You can delete your Spinning Top account from the My Account page, or ask us to delete it by emailing ${EMAIL}; your account data is then deleted, apart from order and payment records we must keep by law (see Retention below).`,
        ),
      ],
    },
    {
      heading: "8. Corporate clients and service personnel",
      blocks: [
        p(
          "Where a hotel, school, office or other organisation books services, we may process professional contact details and other information needed to manage the contract. Roles, access rights and any data-processing responsibilities will be agreed where applicable. We will not use corporate customer information for unrelated marketing without a lawful basis.",
        ),
      ],
    },
    {
      heading: "9. Marketing communications",
      blocks: [
        p(
          `Where you opt in, we may send you offers, product updates and Training Academy announcements via the channels you select. You can withdraw your consent or opt out at any time using the message instructions or by contacting ${EMAIL}.`,
        ),
        p(
          "Withdrawing marketing consent does not stop necessary transactional updates, including order confirmations, delivery arrangements or important service notices.",
        ),
      ],
    },
    {
      heading: "10. International transfers",
      blocks: [
        p(
          "Some hosting, cloud, payment or communication providers may process data outside Nigeria. Where transfers occur, we will assess the destination, applicable lawful transfer mechanism, safeguards and any additional duties under the NDPA and GAID.",
        ),
        p(
          "In particular, our database and sign-in provider (Supabase), Google and WhatsApp may store or process data in data centres outside Nigeria, including in the European Union and the United States. These providers apply contractual and technical safeguards such as encryption in transit and at rest and restricted access. You can request information about applicable transfer safeguards through our privacy contact.",
        ),
      ],
    },
    {
      heading: "11. Retention and deletion",
      blocks: [
        p(
          "We retain personal data for no longer than necessary for the stated purposes, subject to applicable accounting, tax, legal, complaint and recordkeeping obligations. Data may be retained longer where genuinely necessary for legal claims or required by law.",
        ),
        p("Our retention periods are:"),
        ul(
          "Customer accounts (including details received through Google sign-in): until you delete your account or ask us to delete it.",
          "Orders, payments, invoices and delivery records: 6 years, to meet tax and accounting duties.",
          "Photos uploaded with booking requests: 12 months.",
          "Service enquiries, booking requests, WhatsApp and other chat messages: 2 years.",
          "Academy enrolment, assessment and certificate records: 6 years.",
          "Marketing preferences: until you withdraw consent or close your account. Security logs: up to 12 months.",
        ),
        p(
          "When personal data is no longer required, we will securely delete or anonymise it, or restrict it where continued retention is legally necessary.",
        ),
      ],
    },
    {
      heading: "12. Security and confidentiality",
      blocks: [
        p(
          "We implement appropriate organisational and technical safeguards proportionate to the data and processing risks, which may include role-based access, secure systems, staff awareness, controlled sharing, appropriate backups and vendor oversight. No digital service is risk-free.",
        ),
        p(
          "If a personal-data breach occurs, we will investigate and contain it, document the incident and notify the Nigeria Data Protection Commission (NDPC) and affected people when required by law. Under section 40 of the NDPA, a qualifying breach likely to create risk to individuals' rights and freedoms requires notification to the NDPC within 72 hours of awareness.",
        ),
      ],
    },
    {
      heading: "13. Your rights under Nigerian data-protection law",
      blocks: [
        p(
          "Subject to statutory conditions and applicable exemptions, you may have rights to receive transparent information, access personal data, seek correction, request deletion or restriction, object to processing, request portability, withdraw consent and contest certain automated decisions.",
        ),
        p(
          `To exercise a right, email ${EMAIL}, describing your request and providing sufficient information for us to verify identity without collecting unnecessary extra data. We will respond within applicable legal timeframes and explain any lawful limitation.`,
        ),
      ],
    },
    {
      heading: "14. Children and Academy students",
      blocks: [
        p(
          "Our general commercial Website is not designed to collect personal information from children independently. If a minor is eligible for a training programme or another service, we will apply the safeguards and parent or guardian involvement required by Nigerian law, including where consent is legally required. If we learn that data was collected improperly, we will take suitable corrective action.",
        ),
      ],
    },
    {
      heading: "15. Photographs, reviews and testimonials",
      blocks: [
        p(
          "Service photographs provided for inspection may be used to perform the relevant order and resolve related questions. We will not publish identifiable customer photographs, names, testimonials or Academy participant images for marketing without an appropriate lawful basis and relevant permissions.",
        ),
        p(
          "Website visuals may include illustrative or AI-generated imagery. Such imagery does not necessarily depict actual staff, customers, branches or facilities; any factual claims about services, locations, reviews or qualifications will be separately verified.",
        ),
      ],
    },
    {
      heading: "16. Automated decisions and profiling",
      blocks: [
        p(
          "We do not currently use profiling or solely automated decisions that produce legal or similarly significant effects. If we introduce them, we will provide the additional notices, safeguards and rights required by law.",
        ),
      ],
    },
    {
      heading: "17. External links",
      blocks: [
        p(
          "Our Website may link to independent payment pages, social media, Linktree or other external websites. Their own privacy practices apply when you leave our services. We recommend reviewing the relevant privacy notice before disclosing information to a third party.",
        ),
      ],
    },
    {
      heading: "18. Complaints and supervisory authority",
      blocks: [
        p(
          `Please first contact us at ${EMAIL} if you have a privacy concern. We will examine the issue and provide a response in accordance with applicable Nigerian law.`,
        ),
        p(
          "You may also lodge a complaint with the Nigeria Data Protection Commission (NDPC), including where you believe your statutory rights have not been respected. Official NDPC website: https://ndpc.gov.ng.",
        ),
      ],
    },
    {
      heading: "19. Updates to this Policy",
      blocks: [
        p(
          "We may update this Policy when services, technology, suppliers or legal duties change. The current version and effective date will appear on the Website. Where required, we will give further notice and request fresh consent before materially changing consent-based activities.",
        ),
      ],
    },
  ],
  contact: {
    heading: "20. Contact details",
    rows: [
      ["Trading name", "Spinning Top Drycleaners & Launderers"],
      ["Registered legal entity", LEGAL_ENTITY],
      ["Principal address", ADDRESS],
      ["Website", "https://www.spinningtop.ng"],
      ["Privacy email", EMAIL],
      ["Telephone / WhatsApp", PHONE],
    ],
  },
};

/** Privacy sections numbered 1, 2, 3… ("Signing in with Google" was added to the original document). */
export const PRIVACY: LegalDoc = {
  ...PRIVACY_SOURCE,
  sections: PRIVACY_SOURCE.sections.map((sec, i) => ({ ...sec, heading: sec.heading.replace(/^\d+\.\s*/, `${i + 1}. `) })),
  contact: {
    ...PRIVACY_SOURCE.contact,
    heading: PRIVACY_SOURCE.contact.heading.replace(/^\d+\.\s*/, `${PRIVACY_SOURCE.sections.length + 1}. `),
  },
};
