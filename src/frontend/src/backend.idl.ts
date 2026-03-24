export const idlFactory = ({ IDL }: any) => {
  return IDL.Service({
    analyzeText: IDL.Func([IDL.Text], [IDL.Text], []),
  });
};
