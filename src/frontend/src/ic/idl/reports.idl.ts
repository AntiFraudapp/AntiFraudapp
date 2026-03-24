import { IDL } from "@dfinity/candid";

export const reportsIdlFactory = ({ IDL }: any) => {
  const ReportType = IDL.Variant({
    Email: IDL.Null,
    Phone: IDL.Null,
    Message: IDL.Null,
    Crypto: IDL.Null,
  });

  const ReportCategory = IDL.Variant({
    Phishing: IDL.Null,
    Scam: IDL.Null,
    Spam: IDL.Null,
    Fraud: IDL.Null,
    Impersonation: IDL.Null,
    Other: IDL.Null,
  });

  const SubmitReportRequest = IDL.Record({
    reportType: ReportType,
    value: IDL.Text,
    category: ReportCategory,
    country: IDL.Text,
    description: IDL.Opt(IDL.Text),
  });

  const LookupResult = IDL.Record({
    riskScore: IDL.Nat8,
    reportCount: IDL.Nat,
    categories: IDL.Vec(ReportCategory),
  });

  return IDL.Service({
    submitReport: IDL.Func([SubmitReportRequest], [IDL.Bool], []),
    lookupEmail: IDL.Func([IDL.Text], [IDL.Opt(LookupResult)], ["query"]),
    lookupPhone: IDL.Func([IDL.Text], [IDL.Opt(LookupResult)], ["query"]),
    lookupMessage: IDL.Func([IDL.Text], [IDL.Opt(LookupResult)], ["query"]),
    lookupCrypto: IDL.Func([IDL.Text], [IDL.Opt(LookupResult)], ["query"]),
  });
};

export type ReportType =
  | { Email: null }
  | { Phone: null }
  | { Message: null }
  | { Crypto: null };

export type ReportCategory =
  | { Phishing: null }
  | { Scam: null }
  | { Spam: null }
  | { Fraud: null }
  | { Impersonation: null }
  | { Other: null };

export interface SubmitReportRequest {
  reportType: ReportType;
  value: string;
  category: ReportCategory;
  country: string;
  description: [] | [string];
}

export interface LookupResult {
  riskScore: number;
  reportCount: bigint;
  categories: ReportCategory[];
}

export interface ReportsCanisterInterface {
  submitReport(request: SubmitReportRequest): Promise<boolean>;
  lookupEmail(email: string): Promise<[] | [LookupResult]>;
  lookupPhone(phone: string): Promise<[] | [LookupResult]>;
  lookupMessage(message: string): Promise<[] | [LookupResult]>;
  lookupCrypto(address: string): Promise<[] | [LookupResult]>;
}
