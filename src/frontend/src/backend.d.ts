import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Location {
    latitude: number;
    longitude: number;
}
export interface FieldSource {
    value: string;
    sourceUrl: string;
}
export interface ExtendedContactDetails {
    content: string;
    contactType: LookupProvider;
    details: ContactDetails;
}
export type LocationShareResult = {
    __kind__: "error";
    error: LocationShareError;
} | {
    __kind__: "success";
    success: null;
} | {
    __kind__: "rateLimited";
    rateLimited: RateLimitError;
};
export interface LocationShareError {
    retryAfter?: bigint;
    message: string;
}
export interface ContactDetails {
    id: string;
    verified: string;
    country: string;
    validationSource?: FieldSource;
    type: string;
    trustScore: string;
    riskScoreDescription: string;
    trustScoreSource?: FieldSource;
    countryValidationSource?: FieldSource;
    address?: string;
    reports: string;
    reportsSource?: FieldSource;
    adjustedRiskScore?: string;
    riskLevel: string;
    riskScore: string;
    adjustedRiskScoreSource?: FieldSource;
}
export interface RiskRequest {
    riskHistory?: Array<bigint>;
    analyzerType: RiskAnalyzerType;
    data?: string;
    target?: string;
    businessProfile?: string;
}
export interface AnalysisResult {
    riskHistory?: Array<bigint>;
    explanation: string;
    score: number;
    businessProfile?: string;
    recommendation: string;
    riskLevel: string;
}
export interface ProviderConfig {
    endpoint?: string;
    name: LookupProvider;
    enabled: boolean;
    apiKey?: string;
}
export interface RiskAnalysis {
    riskHistory?: Array<bigint>;
    explanation: string;
    score: number;
    businessProfile?: string;
    recommendation: string;
    riskLevel: string;
}
export interface RateLimitError {
    retryAfterSeconds: bigint;
    message: string;
}
export interface AnalysisRequest {
    riskHistory?: Array<bigint>;
    analyzerType: RiskAnalyzerType;
    data?: string;
    target?: string;
    businessProfile?: string;
}
export type AnalysisResponse = {
    __kind__: "result";
    result: AnalysisResult;
} | {
    __kind__: "error";
    error: AnalysisError;
};
export interface AnalysisError {
    message: string;
    details?: string;
}
export interface TermsDocument {
    legalText: string;
    version: string;
}
export type LookupProvider = {
    __kind__: "numLookup";
    numLookup: null;
} | {
    __kind__: "custom";
    custom: string;
} | {
    __kind__: "google";
    google: null;
} | {
    __kind__: "amazon";
    amazon: null;
};
export type RiskResponse = {
    __kind__: "result";
    result: RiskAnalysis;
} | {
    __kind__: "error";
    error: AnalysisError;
};
export interface UserProfile {
    name: string;
}
export interface TrustedContact {
    id: bigint;
    verified: string;
    verificationDate?: string;
    contactType: string;
    validationSource?: string;
    name: string;
    extraInfo?: string;
    trustScoreSource?: string;
    details?: string;
    reportsSource?: string;
    riskLevel: string;
    lookupProvider: string;
    riskScore?: bigint;
    normalizedContact: string;
}
export enum JoinSessionResult {
    ok = "ok",
    invalidCode = "invalidCode",
    sessionNotFound = "sessionNotFound"
}
export enum JoinTokenValidationResult {
    incorrectCode = "incorrectCode",
    success = "success",
    invalidToken = "invalidToken",
    sessionNotFound = "sessionNotFound"
}
export enum RiskAnalyzerType {
    email = "email",
    crypto = "crypto",
    message = "message",
    phone = "phone"
}
export enum SessionStatus {
    active = "active",
    expired = "expired",
    pending = "pending",
    stopped = "stopped",
    ended = "ended"
}
export enum TargetType {
    email = "email",
    crypto = "crypto",
    message = "message",
    phoneNumber = "phoneNumber"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum ValidateCodeResult {
    invalidCode = "invalidCode",
    success = "success",
    sessionNotFound = "sessionNotFound"
}
export interface backendInterface {
    addTrustedContact(trustedContact: TrustedContact): Promise<bigint>;
    analyze(request: RiskRequest): Promise<RiskResponse>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearCryptoReports(address: string): Promise<void>;
    clearPhoneReports(phone: string): Promise<void>;
    clearTrustedContacts(): Promise<void>;
    createLocationShareSession(phoneNumber1: string, phoneNumber2: string, code: string, joinToken: string): Promise<[bigint, string, boolean]>;
    endSession(sessionId: bigint): Promise<void>;
    getAllTrustedContacts(): Promise<Array<TrustedContact>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCryptoReports(address: string): Promise<bigint | null>;
    getCurrentTerms(): Promise<TermsDocument>;
    getLookupDetails(key: string): Promise<ExtendedContactDetails | null>;
    getPhoneReports(phone: string): Promise<bigint | null>;
    getProviderConfig(name: string): Promise<ProviderConfig | null>;
    getSessionLocations(sessionId: bigint): Promise<[Location | null, Location | null]>;
    getSessionStatus(sessionId: bigint): Promise<SessionStatus>;
    getTrustedContactById(id: bigint): Promise<TrustedContact | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserRole(user: Principal): Promise<UserRole>;
    isAdmin(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    joinSession(code: string): Promise<JoinSessionResult>;
    oldAnalyze(request: AnalysisRequest): Promise<AnalysisResponse>;
    recordConsent(sessionId: bigint, phoneNumber: string): Promise<boolean>;
    report(targetType: TargetType, target: string, category: string | null): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setProviderConfig(name: string, config: ProviderConfig): Promise<void>;
    stopSharing(sessionId: bigint): Promise<boolean>;
    updateLocation(sessionId: bigint, phoneNumber: string, loc: Location): Promise<LocationShareResult>;
    updateTerms(newTerms: TermsDocument): Promise<void>;
    validateJoinToken(joinToken: string, confirmationCode: string): Promise<JoinTokenValidationResult>;
    validateSessionCode(sessionId: bigint, code: string): Promise<ValidateCodeResult>;
}
