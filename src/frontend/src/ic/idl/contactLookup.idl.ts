import { IDL } from "@dfinity/candid";

export const contactLookupIdlFactory = ({ IDL }: any) => {
  return IDL.Service({
    healthCheck: IDL.Func([], [IDL.Bool], ["query"]),
  });
};

export interface ContactLookupCanisterInterface {
  healthCheck: () => Promise<boolean>;
}
