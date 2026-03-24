// IDL matching denuncias.mo — canister 7w5qg-6aaaa-aaaab-ael4a-cai

export const denunciasIdlFactory = ({ IDL }: any) => {
  const Report = IDL.Record({
    id: IDL.Nat,
    reportType: IDL.Text,
    target: IDL.Text,
    description: IDL.Text,
    riskScore: IDL.Nat,
    country: IDL.Text,
    city: IDL.Text,
    lat: IDL.Float64,
    lon: IDL.Float64,
    timestamp: IDL.Int,
    reporter: IDL.Opt(IDL.Principal),
  });

  return IDL.Service({
    submitReport: IDL.Func(
      [
        IDL.Text,
        IDL.Text,
        IDL.Text,
        IDL.Nat,
        IDL.Text,
        IDL.Text,
        IDL.Float64,
        IDL.Float64,
      ],
      [IDL.Nat],
      [],
    ),
    getReports: IDL.Func([], [IDL.Vec(Report)], ["query"]),
    getReportsByType: IDL.Func([IDL.Text], [IDL.Vec(Report)], ["query"]),
    getReportsByCountry: IDL.Func([IDL.Text], [IDL.Vec(Report)], ["query"]),
    getRecentReports: IDL.Func([IDL.Nat], [IDL.Vec(Report)], ["query"]),
    getTotalReports: IDL.Func([], [IDL.Nat], ["query"]),
    getReportById: IDL.Func([IDL.Nat], [IDL.Opt(Report)], ["query"]),
  });
};

export interface CanisterReport {
  id: bigint;
  reportType: string;
  target: string;
  description: string;
  riskScore: bigint;
  country: string;
  city: string;
  lat: number;
  lon: number;
  timestamp: bigint;
  reporter: [] | [{ toText(): string }];
}

export interface DenunciasCanisterInterface {
  submitReport(
    reportType: string,
    target: string,
    description: string,
    riskScore: bigint,
    country: string,
    city: string,
    lat: number,
    lon: number,
  ): Promise<bigint>;
  getReports(): Promise<CanisterReport[]>;
  getReportsByType(reportType: string): Promise<CanisterReport[]>;
  getReportsByCountry(country: string): Promise<CanisterReport[]>;
  getRecentReports(limit: bigint): Promise<CanisterReport[]>;
  getTotalReports(): Promise<bigint>;
  getReportById(id: bigint): Promise<[] | [CanisterReport]>;
}
