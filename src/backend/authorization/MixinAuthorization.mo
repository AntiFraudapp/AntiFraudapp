import AccessControl "./access-control";
import Prim "mo:prim";
import Runtime "mo:core/Runtime";

mixin (accessControlState : AccessControl.AccessControlState) {
  // Initialize auth (first caller becomes admin, others become users)
  // Implementa compatibilidade temporária durante migração Caffeine -> AntiFraudapp
  // 1. Tenta ANTIFRAUDAPP_ADMIN_TOKEN (novo)
  // 2. Se não existir, usa CAFFEINE_ADMIN_TOKEN (compatibilidade)
  // 3. Será removido CAFFEINE_ADMIN_TOKEN quando migração estiver completa
  public shared ({ caller }) func _initializeAccessControlWithSecret(userSecret : Text) : async () {
    let adminToken = switch (Prim.envVar<system>("ANTIFRAUDAPP_ADMIN_TOKEN")) {
      case (?token) { ?token };
      case (null) { Prim.envVar<system>("CAFFEINE_ADMIN_TOKEN") };
    };
    
    switch (adminToken) {
      case (null) {
        Runtime.trap("ANTIFRAUDAPP_ADMIN_TOKEN or CAFFEINE_ADMIN_TOKEN environment variable is not set");
      };
      case (?token) {
        AccessControl.initialize(accessControlState, caller, token, userSecret);
      };
    };
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    // Admin-only check happens inside
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };
};
