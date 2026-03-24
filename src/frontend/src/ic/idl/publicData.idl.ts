import { IDL } from "@dfinity/candid";

export const publicDataIdlFactory = ({ IDL }: any) => {
  return IDL.Service({
    healthCheck: IDL.Func([], [IDL.Bool], ["query"]),
  });
};

export interface PublicDataCanisterInterface {
  healthCheck: () => Promise<boolean>;
}
