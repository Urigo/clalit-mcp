/**
 * Record sources: portal pages that show one grid of rows about the member
 * (diagnoses, sensitivities, regular medications, purchases, imaging, …).
 *
 * They all share Clalit Online's grid markup — `table.ClalitGridTable` with
 * `th` headers and `tr.ClalitGridRow` / `tr.ClalitGridAltRow` rows — and most
 * share the date-range search (`txtFromDate` / `txtToDate` + a "show" link
 * button) and the DownloadPdfBtnBinder flow for a row's PDF (`data-actionurl`
 * selects the document, then the source's `.ashx` streams it).
 *
 * Every entry here was observed on the live portal (tools/sitemap.mts);
 * never widen the list without evidence.
 */
export interface RecordSource {
  /** Stable id used by CLI/MCP and as the export folder name. */
  id: string;
  /** Hebrew portal title, for display. */
  title: string;
  /** English description for tool help. */
  description: string;
  /** Page path. */
  path: string;
  /** Part of the grid table's id, when the page has more than one table. */
  gridId?: string;
  /** Date-range search form, when the page has one. */
  search?: RecordSearch;
  /** Pager: `__EVENTTARGET` prefix for page N (`${linkPrefix}${N}`). */
  pagerLinkPrefix?: string;
  /** PDF stream path for rows with `data-actionurl`. */
  pdfPath?: string;
  /** What the portal says about the page's coverage, for the export README. */
  notes?: string;
}

export interface RecordSearch {
  fromField: string;
  toField: string;
  /** Earliest `dd.MM.yyyy` to ask for; the portal's own default is a year back. */
  minDate: string;
  /** `__EVENTTARGET` of the "show" button. */
  submit: string;
  /** Fixed extra fields (checkboxes to tick, dropdowns to set). */
  fields?: Record<string, string>;
  /** A required dropdown that searches one value at a time (hospital); listing walks every option. */
  fanOutSelect?: string;
}

const BODY = "ctl00$ctl00$cphBody$bodyContent$";

export const RECORD_SOURCES: readonly RecordSource[] = [
  {
    id: "diagnoses",
    title: "האבחנות שלי",
    description: "Diagnoses recorded by the member's doctors (date, doctor, specialty, diagnosis).",
    path: "/OnlineWeb/Services/Diagnosis/Diagnosis.aspx",
    gridId: "gvDiagnosis",
    notes: "Diagnoses marked confidential are not shown by the portal.",
  },
  {
    id: "sensitivities",
    title: "הרגישויות שלי",
    description: "Allergies and sensitivities (substance, date recorded, doctor, reaction, reported by).",
    path: "/OnlineWeb/Services/Sensitivities/Sensitivities.aspx",
    gridId: "gvSensitivities",
  },
  {
    id: "chronic_medications",
    title: "תרופות קבועות",
    description: "Regular (chronic) medications: name, since when, prescribing doctor, last prescription's validity.",
    path: "/OnlineWeb/Services/Medicine/PatientChronicDrugs.aspx",
    gridId: "gvChronicMedications",
  },
  {
    id: "medicines_purchased",
    title: "תרופות שנקנו",
    description: "Medicines bought at Clalit pharmacies since August 2008: name, purchase date, chronic flag, quantity, prescriber.",
    path: "/onlineweb/Services/Medicine/MedicineSearch.aspx",
    gridId: "MedicineSearchCustomGrid",
    search: {
      fromField: `${BODY}dateRange$txtFromDate`,
      toField: `${BODY}dateRange$txtToDate`,
      minDate: "01.08.2008",
      submit: `${BODY}btnShow$lnkSubButton`,
    },
    pagerLinkPrefix: `${BODY}MedicineSearchCustomGrid$PagerLink-`,
    notes: "Only purchases from August 2008 on, at Clalit pharmacies; medicines marked sensitive are not shown.",
  },
  {
    id: "medication_approvals",
    title: "אישורי תרופות",
    description: "Special-approval requests for medications (name, request date, status, approval validity).",
    path: "/OnlineWeb/Services/Medicine/PatientExceptionMedRequests.aspx",
    gridId: "gvExceptionMedRequests",
    search: {
      fromField: `${BODY}DatepickerRangeCalendar$txtFromDate`,
      toField: `${BODY}DatepickerRangeCalendar$txtToDate`,
      minDate: "01.01.2007",
      submit: `${BODY}btnRequestsSearch$lnkSubButton`,
    },
  },
  {
    id: "imaging_clinics",
    title: "פענוחי דימות ממרפאות כללית",
    description: "Imaging reports from Clalit clinics (date, exam, referrer, status) with the report PDF.",
    path: "/OnlineWeb/Services/Rentgen/Rentgen.aspx",
    gridId: "gvRentgenNew",
    search: {
      fromField: `${BODY}DatepickerRangeCalendar1$txtFromDate`,
      toField: `${BODY}DatepickerRangeCalendar1$txtToDate`,
      minDate: "01.01.2000",
      submit: `${BODY}btnShow$lnkSubButton`,
    },
    // The web page opens the selected report through RentgenView.aspx, which answers with the PDF itself;
    // RentgenPDFHandler.ashx is the app's route and answers HTML here.
    pdfPath: "/OnlineWeb/Services/Rentgen/RentgenView.aspx",
    notes: "Exams marked sensitive are not shown; the images themselves are not fetched, only the report.",
  },
  {
    id: "imaging_hospitals",
    title: "פענוחי דימות מבתי החולים של כללית",
    description: "Imaging reports from Clalit hospitals, searched per hospital, with the report PDF.",
    path: "/OnlineWeb/ServicesForAll/HospitalsVisits/RentgenHospitals.aspx",
    search: {
      fromField: `${BODY}DatepickerRangeCalendar1$txtFromDate`,
      toField: `${BODY}DatepickerRangeCalendar1$txtToDate`,
      minDate: "01.01.2000",
      submit: `${BODY}btnShow$lnkSubButton`,
      fanOutSelect: `${BODY}ddlHospitalName`,
    },
    pdfPath: "/OnlineWeb/ServicesForAll/HospitalsVisits/RentgenView.aspx",
  },
  {
    id: "imaging_external",
    title: "פענוחי דימות ממכונים חיצוניים",
    description: "Imaging reports from external institutes (date, exam, referrer, institute) with the report PDF.",
    path: "/OnlineWeb/Services/rentgen/rentgenmor.aspx",
    gridId: "gvMahonMorNew",
    search: {
      fromField: `${BODY}DatepickerRangeCalendar1$txtFromDate`,
      toField: `${BODY}DatepickerRangeCalendar1$txtToDate`,
      minDate: "01.01.2000",
      submit: `${BODY}btnShow$lnkSubButton`,
    },
    pdfPath: "/OnlineWeb/Services/Fetoprotein/AFPDisplayPDF.ashx?print=false",
  },
  {
    id: "hospital_visits",
    title: "הביקורים שלי בבתי החולים",
    description: "Visits at Clalit hospitals, searched per hospital.",
    path: "/OnlineWeb/ServicesForAll/HospitalsVisits/HospitalsVisitsList.aspx",
    search: {
      fromField: `${BODY}LabsHistory1$datepickerRangeCalendar$txtFromDate`,
      toField: `${BODY}LabsHistory1$datepickerRangeCalendar$txtToDate`,
      minDate: "01.01.2000",
      submit: `${BODY}LabsHistory1$btnGetTestsAcc$lnkSubButton`,
      fanOutSelect: `${BODY}LabsHistory1$ddlHospitalName`,
    },
    notes: "Only Clalit hospitals; visits marked sensitive are not shown.",
  },
  {
    id: "hospital_labs",
    title: "בדיקות מעבדה מבתי חולים",
    description: "Laboratory tests done at Clalit hospitals (separate from the clinic labs list), searched per hospital.",
    path: "/OnlineWeb/Services/HospitalsLabs/HospitalsLabsTestList.aspx",
    search: {
      fromField: `${BODY}LabsHistory1$datepickerRangeCalendar$txtFromDate`,
      toField: `${BODY}LabsHistory1$datepickerRangeCalendar$txtToDate`,
      minDate: "01.01.2000",
      submit: `${BODY}LabsHistory1$btnGetTestsAcc$lnkSubButton`,
      fanOutSelect: `${BODY}LabsHistory1$ddlHospitalName`,
    },
    notes: "Only Clalit hospitals; tests marked sensitive are not shown.",
  },
];

export const REFERRALS_SOURCE: RecordSource = {
  id: "referrals",
  title: "ההפניות שלי",
  description:
    "Referrals (general הפניות, not lab orders): what each is for, its date, referrer, validity and the services it covers, with the referral PDF. The portal searches the last year only.",
  path: "/OnlineWeb/Services/MedicalReferrals/MedicalReferrals.aspx",
  search: {
    fromField: `${BODY}dateRange$txtFromDate`,
    toField: `${BODY}dateRange$txtToDate`,
    // The portal only searches the last year; the reader asks from a year back.
    minDate: "",
    submit: `${BODY}btnShow$lnkSubButton`,
    fields: { [`${BODY}MedicalReferralsList$chkNotValid`]: "on" },
  },
  pdfPath: "/OnlineWeb/Services/MedicalReferrals/MedicalReferralPDFHandler.ashx?Print=false",
  notes: "The portal keeps only the last year of referrals; referrals marked sensitive are not shown.",
};

export const ALL_RECORD_SOURCES: readonly RecordSource[] = [...RECORD_SOURCES, REFERRALS_SOURCE];
export const RECORD_SOURCE_IDS = ALL_RECORD_SOURCES.map((s) => s.id);

export function recordSource(id: string): RecordSource | undefined {
  return ALL_RECORD_SOURCES.find((s) => s.id === id);
}
