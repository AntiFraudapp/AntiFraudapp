import { CANISTER_IDS } from "./canisterIds";
import type { ContactLookupCanisterInterface } from "./idl/contactLookup.idl";
import type { ExtraCanisterInterface } from "./idl/extra.idl";
import type { MainCanisterInterface } from "./idl/main.idl";
import type { PublicDataCanisterInterface } from "./idl/publicData.idl";
import type { ReportsCanisterInterface } from "./idl/reports.idl";

interface ReadinessReport {
  canisterIds: typeof CANISTER_IDS;
  actors: {
    main: {
      available: boolean;
      methods: {
        analyzeText: boolean;
      };
    };
    extra: {
      available: boolean;
      methods: {
        getPhoneReports: boolean;
        getCryptoReports: boolean;
      };
    };
    reports: {
      available: boolean;
      methods: {
        lookupEmail: boolean;
        lookupPhone: boolean;
        lookupMessage: boolean;
        lookupCrypto: boolean;
        submitReport: boolean;
      };
    };
    contactLookup: {
      available: boolean;
      methods: {
        healthCheck: boolean;
      };
    };
    publicData: {
      available: boolean;
      methods: {
        healthCheck: boolean;
      };
    };
  };
}

export function generateReadinessReport(
  mainActor: MainCanisterInterface | null,
  extraActor: ExtraCanisterInterface | null,
  reportsActor: ReportsCanisterInterface | null,
  contactLookupActor: ContactLookupCanisterInterface | null,
  publicDataActor: PublicDataCanisterInterface | null,
): ReadinessReport {
  const report: ReadinessReport = {
    canisterIds: CANISTER_IDS,
    actors: {
      main: {
        available: mainActor !== null,
        methods: {
          analyzeText:
            mainActor !== null && typeof mainActor.analyzeText === "function",
        },
      },
      extra: {
        available: extraActor !== null,
        methods: {
          getPhoneReports:
            extraActor !== null &&
            typeof extraActor.getPhoneReports === "function",
          getCryptoReports:
            extraActor !== null &&
            typeof extraActor.getCryptoReports === "function",
        },
      },
      reports: {
        available: reportsActor !== null,
        methods: {
          lookupEmail:
            reportsActor !== null &&
            typeof reportsActor.lookupEmail === "function",
          lookupPhone:
            reportsActor !== null &&
            typeof reportsActor.lookupPhone === "function",
          lookupMessage:
            reportsActor !== null &&
            typeof reportsActor.lookupMessage === "function",
          lookupCrypto:
            reportsActor !== null &&
            typeof reportsActor.lookupCrypto === "function",
          submitReport:
            reportsActor !== null &&
            typeof reportsActor.submitReport === "function",
        },
      },
      contactLookup: {
        available: contactLookupActor !== null,
        methods: {
          healthCheck:
            contactLookupActor !== null &&
            typeof contactLookupActor.healthCheck === "function",
        },
      },
      publicData: {
        available: publicDataActor !== null,
        methods: {
          healthCheck:
            publicDataActor !== null &&
            typeof publicDataActor.healthCheck === "function",
        },
      },
    },
  };

  return report;
}

export function logReadinessReport(report: ReadinessReport): void {
  console.group("🔍 AntiFraud Readiness Report");

  console.log("📋 Canister IDs:");
  console.log(`  Main:          ${report.canisterIds.main}`);
  console.log(`  Extra:         ${report.canisterIds.extra}`);
  console.log(`  Reports:       ${report.canisterIds.reports}`);
  console.log(`  ContactLookup: ${report.canisterIds.contactLookup}`);
  console.log(`  PublicData:    ${report.canisterIds.publicData}`);

  console.log("\n🎭 Actor Status:");

  console.log(`  Main Actor: ${report.actors.main.available ? "✅" : "❌"}`);
  if (report.actors.main.available) {
    console.log(
      `    - analyzeText: ${report.actors.main.methods.analyzeText ? "✅" : "❌"}`,
    );
  }

  console.log(`  Extra Actor: ${report.actors.extra.available ? "✅" : "❌"}`);
  if (report.actors.extra.available) {
    console.log(
      `    - getPhoneReports: ${report.actors.extra.methods.getPhoneReports ? "✅" : "❌"}`,
    );
    console.log(
      `    - getCryptoReports: ${report.actors.extra.methods.getCryptoReports ? "✅" : "❌"}`,
    );
  }

  console.log(
    `  Reports Actor: ${report.actors.reports.available ? "✅" : "❌"}`,
  );
  if (report.actors.reports.available) {
    console.log(
      `    - lookupEmail: ${report.actors.reports.methods.lookupEmail ? "✅" : "❌"}`,
    );
    console.log(
      `    - lookupPhone: ${report.actors.reports.methods.lookupPhone ? "✅" : "❌"}`,
    );
    console.log(
      `    - lookupMessage: ${report.actors.reports.methods.lookupMessage ? "✅" : "❌"}`,
    );
    console.log(
      `    - lookupCrypto: ${report.actors.reports.methods.lookupCrypto ? "✅" : "❌"}`,
    );
    console.log(
      `    - submitReport: ${report.actors.reports.methods.submitReport ? "✅" : "❌"}`,
    );
  }

  console.log(
    `  ContactLookup Actor: ${report.actors.contactLookup.available ? "✅" : "❌"}`,
  );
  if (report.actors.contactLookup.available) {
    console.log(
      `    - healthCheck: ${report.actors.contactLookup.methods.healthCheck ? "✅" : "❌"}`,
    );
  }

  console.log(
    `  PublicData Actor: ${report.actors.publicData.available ? "✅" : "❌"}`,
  );
  if (report.actors.publicData.available) {
    console.log(
      `    - healthCheck: ${report.actors.publicData.methods.healthCheck ? "✅" : "❌"}`,
    );
  }

  console.groupEnd();
}
