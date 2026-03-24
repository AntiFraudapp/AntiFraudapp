// Canister: 7w5qg-6aaaa-aaaab-ael4a-cai
// Deploy: dfx deploy denuncias --network ic
import Time "mo:base/Time";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Float "mo:base/Float";
import Principal "mo:base/Principal";
import Buffer "mo:base/Buffer";

actor Denuncias {

  type Report = {
    id: Nat;
    reportType: Text; // "phone" | "email" | "link" | "crypto" | "message" | "iban"
    target: Text;
    description: Text;
    riskScore: Nat; // 1-99
    country: Text;
    city: Text;
    lat: Float;
    lon: Float;
    timestamp: Int;
    reporter: ?Principal;
  };

  stable var nextId : Nat = 1;
  stable var reportsStable : [Report] = [];
  var reports : Buffer.Buffer<Report> = Buffer.Buffer(100);

  system func preupgrade() {
    reportsStable := Buffer.toArray(reports);
  };

  system func postupgrade() {
    for (r in reportsStable.vals()) {
      reports.add(r);
    };
  };

  public shared(msg) func submitReport(
    reportType: Text,
    target: Text,
    description: Text,
    riskScore: Nat,
    country: Text,
    city: Text,
    lat: Float,
    lon: Float
  ) : async Nat {
    let id = nextId;
    nextId += 1;
    let report : Report = {
      id;
      reportType;
      target;
      description;
      riskScore;
      country;
      city;
      lat;
      lon;
      timestamp = Time.now();
      reporter = ?msg.caller;
    };
    reports.add(report);
    id
  };

  public query func getReports() : async [Report] {
    Buffer.toArray(reports)
  };

  public query func getReportsByType(reportType: Text) : async [Report] {
    Array.filter<Report>(Buffer.toArray(reports), func(r) { r.reportType == reportType })
  };

  public query func getReportsByCountry(country: Text) : async [Report] {
    Array.filter<Report>(Buffer.toArray(reports), func(r) { r.country == country })
  };

  public query func getRecentReports(limit: Nat) : async [Report] {
    let all = Buffer.toArray(reports);
    let size = all.size();
    if (size == 0) return [];
    let start = if (size > limit) { size - limit } else { 0 };
    Array.tabulate<Report>(size - start, func(i) { all[start + i] })
  };

  public query func getTotalReports() : async Nat {
    reports.size()
  };

  public query func getReportById(id: Nat) : async ?Report {
    let all = Buffer.toArray(reports);
    Array.find<Report>(all, func(r) { r.id == id })
  };

};
