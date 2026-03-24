import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Time "mo:core/Time";
import CoreSet "mo:core/Set";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";



actor {
  // Types
  public type ReportCount = {
    target : Text;
    count : Nat;
    category : ?Text;
  };

  public type AuthenticatedReport = {
    targetType : Text;
    target : Text;
    hash : Text;
    timestamp : Int;
    category : ?Text;
  };

  public type RiskScoreRange = {
    minimum : Nat;
    maximum : Nat;
    criticalMatchesRequired : Nat;
    supplementalMatchesAllowed : Nat;
  };

  public type RiskCategory = {
    cripto : Text;
    dinheiro : Text;
    fraude : Text;
    urgente : Text;
  };

  public type MatchResult = {
    criticalMatches : Nat;
    supplementalMatches : Nat;
    riskCategoryMatches : Nat;
  };

  public type TrustedContact = {
    id : Nat;
    name : Text;
    contactType : Text;
    normalizedContact : Text;
    details : ?Text;
    verified : Text;
    riskLevel : Text;
    riskScore : ?Nat;
    lookupProvider : Text;
    extraInfo : ?Text;
    validationSource : ?Text;
    reportsSource : ?Text;
    trustScoreSource : ?Text;
    verificationDate : ?Text;
  };

  public type TargetType = { #message; #phoneNumber; #email; #crypto };

  public type UserProfile = {
    name : Text;
  };

  public type TermsDocument = {
    version : Text;
    legalText : Text;
  };

  public type LookupProvider = {
    #numLookup;
    #google;
    #amazon;
    #custom : Text;
  };

  public type RiskAnalyzerType = {
    #message;
    #phone;
    #email;
    #crypto;
  };

  public type AnalysisRequest = {
    analyzerType : RiskAnalyzerType;
    target : ?Text;
    data : ?Text;
    riskHistory : ?[Nat];
    businessProfile : ?Text;
  };

  public type AnalysisResult = {
    score : Float;
    riskLevel : Text;
    explanation : Text;
    recommendation : Text;
    riskHistory : ?[Nat];
    businessProfile : ?Text;
  };

  public type AnalysisError = {
    message : Text;
    details : ?Text;
  };

  public type AnalysisResponse = {
    #result : AnalysisResult;
    #error : AnalysisError;
  };

  public type FieldSource = {
    value : Text;
    sourceUrl : Text;
  };

  public type ContactDetails = {
    id : Text;
    type_ : Text;
    country : Text;
    address : ?Text;
    verified : Text;
    riskLevel : Text;
    riskScore : Text;
    reports : Text;
    trustScore : Text;
    validationSource : ?FieldSource;
    reportsSource : ?FieldSource;
    trustScoreSource : ?FieldSource;
    countryValidationSource : ?FieldSource;
    adjustedRiskScoreSource : ?FieldSource;
    adjustedRiskScore : ?Text;
    riskScoreDescription : Text;
  };

  public type ExtendedContactDetails = {
    contactType : LookupProvider;
    content : Text;
    details : ContactDetails;
  };

  public type ProviderConfig = {
    name : LookupProvider;
    apiKey : ?Text;
    endpoint : ?Text;
    enabled : Bool;
  };

  public type RiskRequest = {
    analyzerType : RiskAnalyzerType;
    target : ?Text;
    data : ?Text;
    riskHistory : ?[Nat];
    businessProfile : ?Text;
  };

  public type RiskAnalysis = {
    score : Float;
    riskLevel : Text;
    explanation : Text;
    recommendation : Text;
    riskHistory : ?[Nat];
    businessProfile : ?Text;
  };

  public type RiskResponse = {
    #result : RiskAnalysis;
    #error : AnalysisError;
  };

  public type DictionaryConfig = {
    highRiskKeywords : CoreSet.Set<Text>;
    highRiskKeywordsSupplemental65To80 : CoreSet.Set<Text>;
    riskScoreRanges : [RiskScoreRange];
    criticalRiskCategories : [RiskCategory];
  };

  public type RiskEngineConfig = {
    currentConfig : DictionaryConfig;
    lastUpdateTimestamp : Nat;
    updateCount : Nat;
    version : Nat;
  };

  // Location Sharing Types
  public type Location = {
    latitude : Float;
    longitude : Float;
  };

  public type SessionStatus = { #pending; #active; #stopped; #expired; #ended };

  public type LocationSession = {
    sessionId : Nat;
    phoneNumber1 : Text;
    phoneNumber2 : Text;
    consent1 : Bool;
    consent2 : Bool;
    verificationCode : Text;
    status : SessionStatus;
    location1 : ?Location;
    location2 : ?Location;
    createdAt : Int;
    lastUpdated : Int;
    joinToken : ?Text;
  };

  public type LocationUpdate = {
    phoneNumber : Text;
    timestamp : Int;
  };

  public type RateLimitError = {
    message : Text;
    retryAfterSeconds : Nat;
  };

  public type LocationShareError = {
    message : Text;
    retryAfter : ?Nat;
  };

  public type LocationShareResult = {
    #success;
    #rateLimited : RateLimitError;
    #error : LocationShareError;
  };

  public type JoinSessionResult = {
    #ok;
    #invalidCode;
    #sessionNotFound;
  };

  public type ValidateCodeResult = {
    #success;
    #invalidCode;
    #sessionNotFound;
  };

  public type JoinTokenValidationResult = {
    #success;
    #invalidToken;
    #sessionNotFound;
    #incorrectCode;
  };

  let persistentTablePhone = Map.empty<Text, Nat>();
  let persistentTableCrypto = Map.empty<Text, Nat>();
  let authenticatedReports = Map.empty<Nat, AuthenticatedReport>();
  var nextAuthenticatedReportId = 0;
  var trustedContactAutoIncrementId = 1;
  let userProfiles = Map.empty<Principal, UserProfile>();
  let providerConfigStore = Map.empty<Text, ProviderConfig>();
  let internationalContactLookup = Map.empty<Text, ExtendedContactDetails>();
  let trustedContacts = Map.empty<Nat, TrustedContact>();
  let riskEngineConfigs = Map.empty<Nat, RiskEngineConfig>();
  var currentConfigId = 1;

  let locationSessions = Map.empty<Nat, LocationSession>();
  let rateLimitMap = Map.empty<Text, [Int]>();
  let phoneNumberSessionMap = Map.empty<Text, Nat>();
  var nextSessionId = 1;

  var currentTerms : TermsDocument = {
    version = "2024-06-07";
    legalText = "
      Identity Trust Platform - Terms of Service and Privacy Policy v2024-06-07

      The Identity Trust Platform (hereinafter referred to as 'the Platform'), operated by Trust Lab (hereinafter 'the Operator'), provides automated identity validation, risk scoring, and fraud prevention services. These Terms of Service and Privacy Policy (collectively, 'Terms') govern your access to and use of the Platform and are binding upon all users.

      1. Agreement to Terms
      By accessing or using the Platform, you confirm that you have read, understood, and agreed to be bound by these Terms. If you do not agree, you must refrain from using the Platform.

      2. Services
      2.1. The Platform offers AI-driven fraud detection, identity verification, reputation scoring, and secure messaging services.
      2.2. The Platform uses automated workflows, machine learning, and third-party data sources for analyzing and validating user identities, contact information, and interactions.
      2.3. Use of the Platform's services is subject to compliance with all applicable laws and regulations.

      3. User Data
      3.1. The Platform processes data provided by users, retrieved from authorized sources, or generated through Platform use, including:
          Contact details (phone numbers, email addresses, crypto wallet addresses)
          Transaction data (consent records, risk assessments)
          Communication metadata (IP addresses, timestamps)
          Risk scoring, reputation ratings, and behavioral patterns
      3.2. All data is processed in compliance with data protection laws, including the General Data Protection Regulation (GDPR) where applicable.
      3.3. Users must ensure that any data provided is accurate, true, and up-to-date.

      4. Data Use and Processing
      4.1. Processed data supports fraud detection, risk analysis, identity verification, and secure communication.
      4.2. Data is anonymized and encrypted where possible, with access governed by strict authorization protocols.
      4.3. Data retention aligns with legal requirements and industry best practices.

      5. User Responsibilities
      5.1. Users must use the Platform for lawful purposes and in compliance with these Terms.
      5.2. Automated tools and AI models are provided 'as is' without warranty as to accuracy or uninterrupted service.
      5.3. Misuse of the Platform, including manipulation, illegal activity, or unauthorized data access, is strictly prohibited.

      6. Liability and Disclaimers
      6.1. The Platform and Operator are not liable for damages or losses resulting from automated decisions, risk scores, or use of services.
      6.2. Users are solely responsible for decisions based on Platform data and risk assessments.
      6.3. The Platform and Operator disclaim all warranties, express or implied.

      7. Updates and Amendments
      7.1. The Platform may update and maintain these Terms with any changes communicated via the Platform.
      7.2. Continued use after changes constitutes acceptance.

      8. Security and Data Protection
      8.1. The Platform employs industry-standard encryption, secure data storage, and access controls.
      8.2. Users must report suspected security breaches or unauthorized access immediately.
      8.3. The Platform and Operator comply with applicable data protection regulations.

      9. Dispute Resolution
      9.1. Disputes arising from these Terms or Platform use are subject to the laws of the operator's jurisdiction.
      9.2. The Platform and Operator may offer alternative dispute resolution methods, including arbitration and mediation.

      10. Contact and Support
      For inquiries regarding these Terms or Platform services, contact the Platform operator via the provided support channels.
    ";
  };

  // Access control state and mixin
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Core methods
  func getDefaultRiskEngineConfig() : DictionaryConfig {
    let keywords = [
      "URGENTE", "ÚLTIMO AVISO", "AÇÃO IMEDIATA", "DINHEIRO", "TRANSFERÊNCIA", "CASH", "PIX", "CARTÃO OFERTA", "COUPON",
      "PRÉMIO", "LUCRATIVO", "GARANTIDO", "RISCO", "RECOMPENSA", "CRÍTICO", "CONTA BLOQUEADA", "CHAVE PRIVADA",
      "SEED PHRASE", "RECOMPENSA"
    ];

    let supplementalKeywords = [
      "pagamento", "pilhagem", "wallet", "viagra", "dúvida"
    ];

    let ranges = [
      { minimum = 80; maximum = 100; criticalMatchesRequired = 3; supplementalMatchesAllowed = 4 },
      { minimum = 60; maximum = 79; criticalMatchesRequired = 1; supplementalMatchesAllowed = 3 },
      { minimum = 30; maximum = 59; criticalMatchesRequired = 0; supplementalMatchesAllowed = 2 },
    ];

    let categories = [
      { cripto = "binance"; dinheiro = "dinheiro"; fraude = "fraude"; urgente = "transação por favor" },
      { cripto = "coinbase"; dinheiro = "conta bancária"; fraude = "golpe"; urgente = "envie agora" }
    ];

    let loweredKeywords = CoreSet.fromIter(keywords.map(func(keyword) { keyword.toLower() }).values());
    let loweredSupplemental = CoreSet.fromIter(supplementalKeywords.map(func(keyword) { keyword.toLower() }).values());

    {
      highRiskKeywords = loweredKeywords;
      highRiskKeywordsSupplemental65To80 = loweredSupplemental;
      riskScoreRanges = ranges;
      criticalRiskCategories = categories;
    };
  };

  func updateRiskEngineConfig(newConfig : DictionaryConfig) {
    let config : RiskEngineConfig = {
      currentConfig = newConfig;
      lastUpdateTimestamp = 0;
      updateCount = 1;
      version = 1;
    };

    riskEngineConfigs.add(1, config);
  };

  func analyzeRisk(content : Text, configId : Nat) : Float {
    switch (riskEngineConfigs.get(configId)) {
      case (null) { 0.0 };
      case (?riskConfig) {
        let loweredContent = content.toLower();

        func containsAnyKeyword(input : Text, keywords : CoreSet.Set<Text>) : Nat {
          var count = 0;
          for (keyword in keywords.values()) {
            if (input.contains(#text keyword)) {
              count += 1;
            };
          };
          count;
        };

        let criticalMatches = containsAnyKeyword(loweredContent, riskConfig.currentConfig.highRiskKeywords);
        let supplementalMatches = containsAnyKeyword(loweredContent, riskConfig.currentConfig.highRiskKeywordsSupplemental65To80);

        let ranges = riskConfig.currentConfig.riskScoreRanges;

        let score = if (criticalMatches > 0) {
          switch (criticalMatches) {
            case (1) { 0.8 };
            case (2) { 0.9 };
            case (_) { 0.95 };
          };
        } else {
          var supplementalScore : Float = 0.0;
          if (supplementalMatches == 1) { supplementalScore := 0.65 };
          if (supplementalMatches == 2) { supplementalScore := 0.70 };
          if (supplementalMatches > 2) { supplementalScore := 0.80 };
          supplementalScore;
        };

        var adjustedScore : Float = 0.0;
        if (criticalMatches >= 3 and score < 0.7) {
          adjustedScore := 0.7;
        } else {
          adjustedScore := score;
        };

        adjustedScore * 100.0;
      };
    };
  };

  func handleReport(targetType : TargetType, target : Text, category : ?Text, submitter : Principal) {
    let hash = submitter.toText();
    let report : AuthenticatedReport = {
      targetType = switch (targetType) {
        case (#phoneNumber) { "phone" };
        case (#email) { "email" };
        case (#crypto) { "crypto" };
        case (#message) { "message" };
      };
      target;
      hash;
      timestamp = 0;
      category;
    };
    authenticatedReports.add(nextAuthenticatedReportId, report);
    nextAuthenticatedReportId += 1;

    switch (targetType) {
      case (#phoneNumber) {
        let currentCount = switch (persistentTablePhone.get(target)) {
          case (?count) { count };
          case (null) { 0 };
        };
        persistentTablePhone.add(target, currentCount + 1);
      };
      case (#crypto) {
        let currentCount = switch (persistentTableCrypto.get(target)) {
          case (?count) { count };
          case (null) { 0 };
        };
        persistentTableCrypto.add(target, currentCount + 1);
      };
      case (#email) {};
      case (#message) {};
    };
  };

  public shared ({ caller }) func report(targetType : TargetType, target : Text, category : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can submit reports");
    };
    handleReport(targetType, target, category, caller);
  };

  public query ({ caller }) func getPhoneReports(phone : Text) : async ?Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view reports");
    };
    persistentTablePhone.get(phone);
  };

  public query ({ caller }) func getCryptoReports(address : Text) : async ?Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view reports");
    };
    persistentTableCrypto.get(address);
  };

  public shared ({ caller }) func clearPhoneReports(phone : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can clear reports");
    };
    persistentTablePhone.remove(phone);
  };

  public shared ({ caller }) func clearCryptoReports(address : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can clear reports");
    };
    persistentTableCrypto.remove(address);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserRole(user : Principal) : async AccessControl.UserRole {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can query roles");
    };
    AccessControl.getUserRole(accessControlState, user);
  };

  public query ({ caller }) func isAdmin() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can check admin status");
    };
    AccessControl.isAdmin(accessControlState, caller);
  };

  public shared ({ caller }) func setProviderConfig(name : Text, config : ProviderConfig) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can modify provider configurations");
    };
    providerConfigStore.add(name, config);
  };

  public query ({ caller }) func getProviderConfig(name : Text) : async ?ProviderConfig {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access provider configurations");
    };
    providerConfigStore.get(name);
  };

  public query ({ caller }) func getLookupDetails(key : Text) : async ?ExtendedContactDetails {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can perform contact lookups");
    };
    internationalContactLookup.get(key);
  };

  public query ({ caller }) func oldAnalyze(request : AnalysisRequest) : async AnalysisResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can perform risk analysis");
    };
    let result : AnalysisResult = {
      score = 0.5;
      riskLevel = "Moderate Risk";
      explanation = "";
      recommendation = "";
      riskHistory = ?[];
      businessProfile = ?"";
    };
    #result(result);
  };

  public query ({ caller }) func analyze(request : RiskRequest) : async RiskResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can perform risk analysis");
    };
    let result : RiskAnalysis = {
      score = 0.5;
      riskLevel = "Moderate Risk";
      explanation = "";
      recommendation = "";
      riskHistory = ?[];
      businessProfile = ?"";
    };
    #result(result);
  };

  func scoreKeywords(content : Text) : Float {
    analyzeRisk(content, currentConfigId);
  };

  public shared ({ caller }) func addTrustedContact(trustedContact : TrustedContact) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only administrators can add trusted contacts");
    };

    let nextId = trustedContactAutoIncrementId;
    trustedContactAutoIncrementId += 1;

    let newContact = {
      trustedContact with
      id = nextId;
      verified = trustedContact.verified;
      riskLevel = trustedContact.riskLevel;
      riskScore = trustedContact.riskScore;
      validationSource = trustedContact.validationSource;
      reportsSource = trustedContact.reportsSource;
      trustScoreSource = trustedContact.trustScoreSource;
    };

    trustedContacts.add(nextId, newContact);

    nextId;
  };

  public shared ({ caller }) func clearTrustedContacts() : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only administrators can clear the trusted contact database");
    };
    trustedContacts.clear();
  };

  public query ({ caller }) func getTrustedContactById(id : Nat) : async ?TrustedContact {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can retrieve trusted contacts");
    };
    trustedContacts.get(id);
  };

  public query ({ caller }) func getAllTrustedContacts() : async [TrustedContact] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can retrieve trusted contacts");
    };
    trustedContacts.values().toArray();
  };

  public query func getCurrentTerms() : async TermsDocument {
    currentTerms;
  };

  public shared ({ caller }) func updateTerms(newTerms : TermsDocument) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only administrators can update the terms");
    };
    currentTerms := newTerms;
  };

  func autoResetStaleSession(phoneNumber : Text) {
    switch (phoneNumberSessionMap.get(phoneNumber)) {
      case (null) {};
      case (?sessionId) {
        switch (locationSessions.get(sessionId)) {
          case (null) {
            phoneNumberSessionMap.remove(phoneNumber);
          };
          case (?session) {
            if (session.status != #expired and session.status != #stopped) {
              let updatedSession = { session with status = #stopped };
              locationSessions.add(sessionId, updatedSession);
              phoneNumberSessionMap.remove(session.phoneNumber1);
              phoneNumberSessionMap.remove(session.phoneNumber2);
            } else {
              phoneNumberSessionMap.remove(phoneNumber);
            };
          };
        };
      };
    };
  };

  // Session creation requires an authenticated user (the initiating party, phone A).
  public shared ({ caller }) func createLocationShareSession(phoneNumber1 : Text, phoneNumber2 : Text, code : Text, joinToken : Text) : async (Nat, Text, Bool) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create location sharing sessions");
    };

    autoResetStaleSession(phoneNumber1);
    autoResetStaleSession(phoneNumber2);

    let sessionId = nextSessionId;
    nextSessionId += 1;

    let session : LocationSession = {
      sessionId;
      phoneNumber1;
      phoneNumber2;
      consent1 = false;
      consent2 = false;
      verificationCode = code;
      status = #pending;
      location1 = null;
      location2 = null;
      createdAt = Time.now();
      lastUpdated = Time.now();
      joinToken = ?joinToken;
    };

    locationSessions.add(sessionId, session);
    phoneNumberSessionMap.add(phoneNumber1, sessionId);
    phoneNumberSessionMap.add(phoneNumber2, sessionId);

    (sessionId, joinToken, true);
  };

  // Validate Session Code — requires authenticated user.
  public shared ({ caller }) func validateSessionCode(sessionId : Nat, code : Text) : async ValidateCodeResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can validate session codes");
    };
    let sessionOpt = locationSessions.get(sessionId);
    switch (sessionOpt) {
      case (null) { #sessionNotFound };
      case (?session) {
        if (session.verificationCode == code and session.status == #pending) {
          let updatedSession = {
            session with
            status = #active;
            lastUpdated = Time.now();
          };
          locationSessions.add(sessionId, updatedSession);
          #success;
        } else { #invalidCode };
      };
    };
  };

  // validateJoinToken is called by phone B who arrives via SMS deep link.
  // Phone B may not be a registered user, so no authentication check is required.
  // The joinToken itself (a long random identifier) combined with the numeric
  // confirmation code provides sufficient proof of intent.
  public shared ({ caller }) func validateJoinToken(joinToken : Text, confirmationCode : Text) : async JoinTokenValidationResult {
    // No authentication required: phone B may be a guest arriving via SMS deep link.
    // Security is provided by the unguessable joinToken and the numeric confirmation code.

    var matchedSessionId : ?Nat = null;
    for ((sessionId, session) in locationSessions.entries()) {
      switch (session.joinToken) {
        case (null) {};
        case (?token) {
          if (token == joinToken) {
            matchedSessionId := ?sessionId;
          };
        };
      };
    };

    switch (matchedSessionId) {
      case (null) { #invalidToken };
      case (?sessionId) {
        switch (locationSessions.get(sessionId)) {
          case (null) { #sessionNotFound };
          case (?session) {
            switch (session.joinToken) {
              case (null) { #invalidToken };
              case (?token) {
                if (token == joinToken and session.verificationCode == confirmationCode) {
                  let updatedSession = {
                    session with
                    status = #active;
                    lastUpdated = Time.now();
                  };
                  locationSessions.add(sessionId, updatedSession);
                  #success;
                } else { #incorrectCode };
              };
            };
          };
        };
      };
    };
  };

  public shared ({ caller }) func recordConsent(sessionId : Nat, phoneNumber : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can record consent");
    };
    let sessionOpt = locationSessions.get(sessionId);
    switch (sessionOpt) {
      case (null) { false };
      case (?session) {
        let newConsent1 = if (phoneNumber == session.phoneNumber1) { true } else {
          session.consent1;
        };
        let newConsent2 = if (phoneNumber == session.phoneNumber2) { true } else {
          session.consent2;
        };

        let updatedSession = {
          session with
          consent1 = newConsent1;
          consent2 = newConsent2;
        };

        locationSessions.add(sessionId, updatedSession);
        true;
      };
    };
  };

  // joinSession is called by phone B who arrives via SMS deep link and enters the
  // numeric code. Phone B may not be a registered user, so no authentication check
  // is required. The 6-digit code provides the necessary proof of intent.
  public shared ({ caller }) func joinSession(code : Text) : async JoinSessionResult {
    // No authentication required: phone B may be a guest arriving via SMS deep link.
    // Security is provided by the numeric confirmation code sent via SMS.

    if (code.size() != 6) {
      return #invalidCode;
    };
    for (c in code.chars()) {
      if (c < '0' or c > '9') {
        return #invalidCode;
      };
    };

    var matchedSessionId : ?Nat = null;
    for ((sessionId, session) in locationSessions.entries()) {
      if (session.verificationCode == code and session.status == #pending) {
        matchedSessionId := ?sessionId;
      };
    };

    switch (matchedSessionId) {
      case (null) { #sessionNotFound };
      case (?sessionId) {
        switch (locationSessions.get(sessionId)) {
          case (null) { #sessionNotFound };
          case (?session) {
            let updatedSession = {
              session with
              status = #active;
              lastUpdated = Time.now();
            };
            locationSessions.add(sessionId, updatedSession);
            #ok;
          };
        };
      };
    };
  };

  // updateLocation requires an authenticated user — only registered participants
  // should be able to push GPS coordinates into a session.
  public shared ({ caller }) func updateLocation(sessionId : Nat, phoneNumber : Text, loc : Location) : async LocationShareResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update location");
    };
    let currentTime = Time.now();
    let oneMinuteInNanos = 60 * 1_000_000_000;

    let history = switch (rateLimitMap.get(phoneNumber)) {
      case (null) { [] };
      case (?list) {
        list.filter(
          func(ts) {
            ts > 0 and ts > (currentTime - oneMinuteInNanos);
          }
        );
      };
    };

    let permissibleUpdates = 10;
    if (history.size() >= permissibleUpdates) {
      let retryAfter = if (history.size() >= 99) { 600 } else {
        if (history.size() >= 15) { 360 } else { 60 };
      };

      let error : RateLimitError = {
        message = "Rate limit exceeded. Try again in " # retryAfter.toText() # " seconds";
        retryAfterSeconds = retryAfter;
      };

      return #rateLimited(error);
    };

    let newHistory = switch (rateLimitMap.get(phoneNumber)) {
      case (null) { [currentTime] };
      case (?existing) { [currentTime].concat(existing) };
    };
    rateLimitMap.add(phoneNumber, newHistory);

    let sessionOpt = locationSessions.get(sessionId);
    switch (sessionOpt) {
      case (null) {
        let error : LocationShareError = { message = "Session not found"; retryAfter = null };
        #error(error);
      };
      case (?session) {
        let (newLoc1, newLoc2) = if (phoneNumber == session.phoneNumber1) {
          (?(loc), session.location2);
        } else {
          (session.location1, ?(loc));
        };

        let updatedSession = {
          session with
          location1 = newLoc1;
          location2 = newLoc2;
          lastUpdated = currentTime;
        };

        locationSessions.add(sessionId, updatedSession);

        if (history.size() >= 15 and history.size() < 20) {
          let period = 60 * ((history.size() * history.size()) + 1);

          let error : LocationShareError = {
            message = "Update accepted but entering cool-down period. Increased backoff: " # period.toText() # " seconds";
            retryAfter = ?period;
          };
          #error(error);
        } else if (history.size() >= 99) {
          let error : LocationShareError = {
            message = "Critical rate limit exceeded. 5 minutes";
            retryAfter = ?300;
          };
          #error(error);
        } else {
          #success;
        };
      };
    };
  };

  public shared ({ caller }) func stopSharing(sessionId : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can stop sharing sessions");
    };
    let sessionOpt = locationSessions.get(sessionId);
    switch (sessionOpt) {
      case (null) { false };
      case (?session) {
        let updatedSession = { session with status = #ended };
        locationSessions.add(sessionId, updatedSession);

        phoneNumberSessionMap.remove(session.phoneNumber1);
        phoneNumberSessionMap.remove(session.phoneNumber2);

        true;
      };
    };
  };

  public shared ({ caller }) func endSession(sessionId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can end sessions");
    };

    switch (locationSessions.get(sessionId)) {
      case (null) { Runtime.trap("Session not found") };
      case (?session) {
        let endedSession = { session with status = #ended };
        locationSessions.add(sessionId, endedSession);
        phoneNumberSessionMap.remove(session.phoneNumber1);
        phoneNumberSessionMap.remove(session.phoneNumber2);
      };
    };
  };

  // getSessionStatus is polled by the session screen. Authenticated users only.
  public query ({ caller }) func getSessionStatus(sessionId : Nat) : async SessionStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can query session status");
    };
    switch (locationSessions.get(sessionId)) {
      case (null) { #expired };
      case (?session) {
        let currentTime = Time.now();
        let oneDayInNanos = 24 * 60 * 60 * 1_000_000_000;
        if (currentTime - session.createdAt > oneDayInNanos) {
          #expired;
        } else { session.status };
      };
    };
  };

  // getSessionLocations returns both devices' last known coordinates for the map view.
  // Requires an authenticated user — only registered participants should read GPS data.
  public query ({ caller }) func getSessionLocations(sessionId : Nat) : async (?Location, ?Location) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can read session locations");
    };
    switch (locationSessions.get(sessionId)) {
      case (null) { (null, null) };
      case (?session) { (session.location1, session.location2) };
    };
  };

};
