// Canister: sodv3-uiaaa-aaaak-qxubq-cai
// Deploy: dfx deploy location --network ic
import Time "mo:base/Time";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Float "mo:base/Float";
import Bool "mo:base/Bool";
import Principal "mo:base/Principal";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Hash "mo:base/Hash";

actor Location {

  type ParticipantLocation = {
    sessionId: Text;
    participantName: Text;
    lat: Float;
    lon: Float;
    accuracy: Float;
    timestamp: Int;
  };

  type Session = {
    sessionId: Text;
    hostName: Text;
    hostPrincipal: Principal;
    createdAt: Int;
    active: Bool;
  };

  // Session expiry: 4 hours in nanoseconds
  let SESSION_EXPIRY : Int = 4 * 60 * 60 * 1_000_000_000;

  stable var sessionsStable : [(Text, Session)] = [];
  stable var locationsStable : [(Text, [ParticipantLocation])] = [];

  var sessions = HashMap.HashMap<Text, Session>(10, Text.equal, Text.hash);
  var locationMap = HashMap.HashMap<Text, Buffer.Buffer<ParticipantLocation>>(10, Text.equal, Text.hash);

  system func preupgrade() {
    sessionsStable := [];
    for ((k, v) in sessions.entries()) {
      sessionsStable := Array.append(sessionsStable, [(k, v)]);
    };
    locationsStable := [];
    for ((k, buf) in locationMap.entries()) {
      locationsStable := Array.append(locationsStable, [(k, Buffer.toArray(buf))]);
    };
  };

  system func postupgrade() {
    for ((k, v) in sessionsStable.vals()) {
      sessions.put(k, v);
    };
    for ((k, locs) in locationsStable.vals()) {
      let buf = Buffer.Buffer<ParticipantLocation>(locs.size());
      for (loc in locs.vals()) { buf.add(loc); };
      locationMap.put(k, buf);
    };
  };

  public shared(msg) func createSession(sessionId: Text, hostName: Text) : async Bool {
    let session : Session = {
      sessionId;
      hostName;
      hostPrincipal = msg.caller;
      createdAt = Time.now();
      active = true;
    };
    sessions.put(sessionId, session);
    locationMap.put(sessionId, Buffer.Buffer<ParticipantLocation>(10));
    true
  };

  public shared func updateLocation(
    sessionId: Text,
    participantName: Text,
    lat: Float,
    lon: Float,
    accuracy: Float
  ) : async Bool {
    switch (sessions.get(sessionId)) {
      case null { false };
      case (?session) {
        if (not session.active) return false;
        let now = Time.now();
        if (now - session.createdAt > SESSION_EXPIRY) {
          sessions.put(sessionId, { session with active = false });
          return false;
        };
        let loc : ParticipantLocation = {
          sessionId;
          participantName;
          lat;
          lon;
          accuracy;
          timestamp = now;
        };
        switch (locationMap.get(sessionId)) {
          case null {
            let buf = Buffer.Buffer<ParticipantLocation>(10);
            buf.add(loc);
            locationMap.put(sessionId, buf);
          };
          case (?buf) {
            // Remove old entry for same participant
            let filtered = Buffer.Buffer<ParticipantLocation>(buf.size());
            for (l in buf.vals()) {
              if (l.participantName != participantName) filtered.add(l);
            };
            filtered.add(loc);
            locationMap.put(sessionId, filtered);
          };
        };
        true
      };
    }
  };

  public query func getSessionLocations(sessionId: Text) : async [ParticipantLocation] {
    switch (locationMap.get(sessionId)) {
      case null { [] };
      case (?buf) { Buffer.toArray(buf) };
    }
  };

  public query func isSessionActive(sessionId: Text) : async Bool {
    switch (sessions.get(sessionId)) {
      case null { false };
      case (?session) {
        session.active and (Time.now() - session.createdAt <= SESSION_EXPIRY)
      };
    }
  };

  public shared(msg) func endSession(sessionId: Text) : async Bool {
    switch (sessions.get(sessionId)) {
      case null { false };
      case (?session) {
        if (session.hostPrincipal == msg.caller) {
          sessions.put(sessionId, { session with active = false });
          true
        } else { false }
      };
    }
  };

};
