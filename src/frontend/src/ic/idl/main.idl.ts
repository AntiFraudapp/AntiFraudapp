import type { IDL } from "@dfinity/candid";

export const idlFactory = ({ IDL: _IDL }: { IDL: typeof IDL }) => {
  const ValidateCodeResult = _IDL.Variant({
    success: _IDL.Null,
    invalidCode: _IDL.Null,
    sessionNotFound: _IDL.Null,
  });

  const JoinSessionResult = _IDL.Variant({
    ok: _IDL.Null,
    invalidCode: _IDL.Null,
    sessionNotFound: _IDL.Null,
  });

  const SessionStatus = _IDL.Variant({
    active: _IDL.Null,
    pending: _IDL.Null,
    stopped: _IDL.Null,
    expired: _IDL.Null,
  });

  const Location = _IDL.Record({
    latitude: _IDL.Float64,
    longitude: _IDL.Float64,
  });

  const RateLimitError = _IDL.Record({
    message: _IDL.Text,
    retryAfterSeconds: _IDL.Nat,
  });

  const LocationShareError = _IDL.Record({
    message: _IDL.Text,
    retryAfter: _IDL.Opt(_IDL.Nat),
  });

  const LocationShareResult = _IDL.Variant({
    success: _IDL.Null,
    rateLimited: RateLimitError,
    error: LocationShareError,
  });

  const UserProfile = _IDL.Record({
    name: _IDL.Text,
  });

  const TermsDocument = _IDL.Record({
    version: _IDL.Text,
    legalText: _IDL.Text,
  });

  const RiskAnalyzerType = _IDL.Variant({
    message: _IDL.Null,
    phone: _IDL.Null,
    email: _IDL.Null,
    crypto: _IDL.Null,
  });

  const AnalysisError = _IDL.Record({
    message: _IDL.Text,
    details: _IDL.Opt(_IDL.Text),
  });

  const AnalysisResult = _IDL.Record({
    score: _IDL.Float64,
    riskLevel: _IDL.Text,
    explanation: _IDL.Text,
    recommendation: _IDL.Text,
    riskHistory: _IDL.Opt(_IDL.Vec(_IDL.Nat)),
    businessProfile: _IDL.Opt(_IDL.Text),
  });

  const AnalysisResponse = _IDL.Variant({
    result: AnalysisResult,
    error: AnalysisError,
  });

  const RiskAnalysis = _IDL.Record({
    score: _IDL.Float64,
    riskLevel: _IDL.Text,
    explanation: _IDL.Text,
    recommendation: _IDL.Text,
    riskHistory: _IDL.Opt(_IDL.Vec(_IDL.Nat)),
    businessProfile: _IDL.Opt(_IDL.Text),
  });

  const RiskResponse = _IDL.Variant({
    result: RiskAnalysis,
    error: AnalysisError,
  });

  const AnalysisRequest = _IDL.Record({
    analyzerType: RiskAnalyzerType,
    target: _IDL.Opt(_IDL.Text),
    data: _IDL.Opt(_IDL.Text),
    riskHistory: _IDL.Opt(_IDL.Vec(_IDL.Nat)),
    businessProfile: _IDL.Opt(_IDL.Text),
  });

  const RiskRequest = _IDL.Record({
    analyzerType: RiskAnalyzerType,
    target: _IDL.Opt(_IDL.Text),
    data: _IDL.Opt(_IDL.Text),
    riskHistory: _IDL.Opt(_IDL.Vec(_IDL.Nat)),
    businessProfile: _IDL.Opt(_IDL.Text),
  });

  const LookupProvider = _IDL.Variant({
    numLookup: _IDL.Null,
    google: _IDL.Null,
    amazon: _IDL.Null,
    custom: _IDL.Text,
  });

  const FieldSource = _IDL.Record({
    value: _IDL.Text,
    sourceUrl: _IDL.Text,
  });

  const ContactDetails = _IDL.Record({
    id: _IDL.Text,
    type_: _IDL.Text,
    country: _IDL.Text,
    address: _IDL.Opt(_IDL.Text),
    verified: _IDL.Text,
    riskLevel: _IDL.Text,
    riskScore: _IDL.Text,
    reports: _IDL.Text,
    trustScore: _IDL.Text,
    validationSource: _IDL.Opt(FieldSource),
    reportsSource: _IDL.Opt(FieldSource),
    trustScoreSource: _IDL.Opt(FieldSource),
    countryValidationSource: _IDL.Opt(FieldSource),
    adjustedRiskScoreSource: _IDL.Opt(FieldSource),
    adjustedRiskScore: _IDL.Opt(_IDL.Text),
    riskScoreDescription: _IDL.Text,
  });

  const ExtendedContactDetails = _IDL.Record({
    contactType: LookupProvider,
    content: _IDL.Text,
    details: ContactDetails,
  });

  const ProviderConfig = _IDL.Record({
    name: LookupProvider,
    apiKey: _IDL.Opt(_IDL.Text),
    endpoint: _IDL.Opt(_IDL.Text),
    enabled: _IDL.Bool,
  });

  const TrustedContact = _IDL.Record({
    id: _IDL.Nat,
    name: _IDL.Text,
    contactType: _IDL.Text,
    normalizedContact: _IDL.Text,
    details: _IDL.Opt(_IDL.Text),
    verified: _IDL.Text,
    riskLevel: _IDL.Text,
    riskScore: _IDL.Opt(_IDL.Nat),
    lookupProvider: _IDL.Text,
    extraInfo: _IDL.Opt(_IDL.Text),
    validationSource: _IDL.Opt(_IDL.Text),
    reportsSource: _IDL.Opt(_IDL.Text),
    trustScoreSource: _IDL.Opt(_IDL.Text),
    verificationDate: _IDL.Opt(_IDL.Text),
  });

  const TargetType = _IDL.Variant({
    message: _IDL.Null,
    phoneNumber: _IDL.Null,
    email: _IDL.Null,
    crypto: _IDL.Null,
  });

  const UserRole = _IDL.Variant({
    admin: _IDL.Null,
    user: _IDL.Null,
    guest: _IDL.Null,
  });

  return _IDL.Service({
    addTrustedContact: _IDL.Func([TrustedContact], [_IDL.Nat], []),
    analyze: _IDL.Func([RiskRequest], [RiskResponse], ["query"]),
    assignCallerUserRole: _IDL.Func([_IDL.Principal, UserRole], [], []),
    clearCryptoReports: _IDL.Func([_IDL.Text], [], []),
    clearPhoneReports: _IDL.Func([_IDL.Text], [], []),
    clearTrustedContacts: _IDL.Func([], [], []),
    createLocationShareSession: _IDL.Func(
      [_IDL.Text, _IDL.Text, _IDL.Text],
      [_IDL.Nat, _IDL.Bool],
      [],
    ),
    getAllTrustedContacts: _IDL.Func([], [_IDL.Vec(TrustedContact)], ["query"]),
    getCallerUserProfile: _IDL.Func([], [_IDL.Opt(UserProfile)], ["query"]),
    getCallerUserRole: _IDL.Func([], [UserRole], ["query"]),
    getCryptoReports: _IDL.Func([_IDL.Text], [_IDL.Opt(_IDL.Nat)], ["query"]),
    getCurrentTerms: _IDL.Func([], [TermsDocument], ["query"]),
    getLookupDetails: _IDL.Func(
      [_IDL.Text],
      [_IDL.Opt(ExtendedContactDetails)],
      ["query"],
    ),
    getPhoneReports: _IDL.Func([_IDL.Text], [_IDL.Opt(_IDL.Nat)], ["query"]),
    getProviderConfig: _IDL.Func(
      [_IDL.Text],
      [_IDL.Opt(ProviderConfig)],
      ["query"],
    ),
    getSessionStatus: _IDL.Func([_IDL.Nat], [SessionStatus], ["query"]),
    getTrustedContactById: _IDL.Func(
      [_IDL.Nat],
      [_IDL.Opt(TrustedContact)],
      ["query"],
    ),
    getUserProfile: _IDL.Func(
      [_IDL.Principal],
      [_IDL.Opt(UserProfile)],
      ["query"],
    ),
    getUserRole: _IDL.Func([_IDL.Principal], [UserRole], ["query"]),
    isAdmin: _IDL.Func([], [_IDL.Bool], ["query"]),
    isCallerAdmin: _IDL.Func([], [_IDL.Bool], ["query"]),
    joinSession: _IDL.Func([_IDL.Text], [JoinSessionResult], []),
    oldAnalyze: _IDL.Func([AnalysisRequest], [AnalysisResponse], ["query"]),
    recordConsent: _IDL.Func([_IDL.Nat, _IDL.Text], [_IDL.Bool], []),
    report: _IDL.Func([TargetType, _IDL.Text, _IDL.Opt(_IDL.Text)], [], []),
    saveCallerUserProfile: _IDL.Func([UserProfile], [], []),
    setProviderConfig: _IDL.Func([_IDL.Text, ProviderConfig], [], []),
    stopSharing: _IDL.Func([_IDL.Nat], [_IDL.Bool], []),
    updateLocation: _IDL.Func(
      [_IDL.Nat, _IDL.Text, Location],
      [LocationShareResult],
      [],
    ),
    updateTerms: _IDL.Func([TermsDocument], [], []),
    validateSessionCode: _IDL.Func(
      [_IDL.Nat, _IDL.Text],
      [ValidateCodeResult],
      [],
    ),
  });
};

// Alias for backward compatibility with existing imports
export const mainIdlFactory = idlFactory;

export const init = ({ IDL: _IDL }: { IDL: typeof IDL }) => [];

// TypeScript interface for the main canister — matches backend.d.ts backendInterface
export interface MainCanisterInterface {
  analyzeText?: (text: string) => Promise<string>;
  addTrustedContact: (trustedContact: any) => Promise<bigint>;
  analyze: (request: any) => Promise<any>;
  assignCallerUserRole: (user: any, role: any) => Promise<void>;
  clearCryptoReports: (address: string) => Promise<void>;
  clearPhoneReports: (phone: string) => Promise<void>;
  clearTrustedContacts: () => Promise<void>;
  createLocationShareSession: (
    phoneNumber1: string,
    phoneNumber2: string,
    code: string,
  ) => Promise<[bigint, boolean]>;
  getAllTrustedContacts: () => Promise<any[]>;
  getCallerUserProfile: () => Promise<any | null>;
  getCallerUserRole: () => Promise<any>;
  getCryptoReports: (address: string) => Promise<bigint | null>;
  getCurrentTerms: () => Promise<any>;
  getLookupDetails: (key: string) => Promise<any | null>;
  getPhoneReports: (phone: string) => Promise<bigint | null>;
  getProviderConfig: (name: string) => Promise<any | null>;
  getSessionStatus: (sessionId: bigint) => Promise<any>;
  getTrustedContactById: (id: bigint) => Promise<any | null>;
  getUserProfile: (user: any) => Promise<any | null>;
  getUserRole: (user: any) => Promise<any>;
  isAdmin: () => Promise<boolean>;
  isCallerAdmin: () => Promise<boolean>;
  joinSession: (code: string) => Promise<any>;
  oldAnalyze: (request: any) => Promise<any>;
  recordConsent: (sessionId: bigint, phoneNumber: string) => Promise<boolean>;
  report: (
    targetType: any,
    target: string,
    category: string | null,
  ) => Promise<void>;
  saveCallerUserProfile: (profile: any) => Promise<void>;
  setProviderConfig: (name: string, config: any) => Promise<void>;
  stopSharing: (sessionId: bigint) => Promise<boolean>;
  updateLocation: (
    sessionId: bigint,
    phoneNumber: string,
    loc: any,
  ) => Promise<any>;
  updateTerms: (newTerms: any) => Promise<void>;
  validateSessionCode: (sessionId: bigint, code: string) => Promise<any>;
}
