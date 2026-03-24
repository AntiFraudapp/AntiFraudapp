import { IDL } from "@dfinity/candid";

export const extraIdlFactory = ({ IDL }: any) => {
  return IDL.Service({
    getPhoneReports: IDL.Func([IDL.Text], [IDL.Opt(IDL.Nat)], ["query"]),
    getCryptoReports: IDL.Func([IDL.Text], [IDL.Opt(IDL.Nat)], ["query"]),
  });
};

export interface ExtraCanisterInterface {
  getPhoneReports(phone: string): Promise<bigint | null>;
  getCryptoReports(address: string): Promise<bigint | null>;
}
