// IDL matching location.mo — canister sodv3-uiaaa-aaaak-qxubq-cai

export const locationIdlFactory = ({ IDL }: any) => {
  const ParticipantLocationRecord = IDL.Record({
    sessionId: IDL.Text,
    participantName: IDL.Text,
    lat: IDL.Float64,
    lon: IDL.Float64,
    accuracy: IDL.Float64,
    timestamp: IDL.Int,
  });

  return IDL.Service({
    createSession: IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
    updateLocation: IDL.Func(
      [IDL.Text, IDL.Text, IDL.Float64, IDL.Float64, IDL.Float64],
      [IDL.Bool],
      [],
    ),
    getSessionLocations: IDL.Func(
      [IDL.Text],
      [IDL.Vec(ParticipantLocationRecord)],
      ["query"],
    ),
    isSessionActive: IDL.Func([IDL.Text], [IDL.Bool], ["query"]),
    endSession: IDL.Func([IDL.Text], [IDL.Bool], []),
  });
};

export interface ParticipantLocation {
  sessionId: string;
  participantName: string;
  lat: number;
  lon: number;
  accuracy: number;
  timestamp: bigint;
}

export interface LocationCanisterInterface {
  createSession(sessionId: string, hostName: string): Promise<boolean>;
  updateLocation(
    sessionId: string,
    participantName: string,
    lat: number,
    lon: number,
    accuracy: number,
  ): Promise<boolean>;
  getSessionLocations(sessionId: string): Promise<ParticipantLocation[]>;
  isSessionActive(sessionId: string): Promise<boolean>;
  endSession(sessionId: string): Promise<boolean>;
}
