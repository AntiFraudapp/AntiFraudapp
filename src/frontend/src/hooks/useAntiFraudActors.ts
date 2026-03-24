import {
  createContactLookupActor,
  createExtraActor,
  createMainActor,
  createPublicDataActor,
  createReportsActor,
} from "@/ic/actors";
import type { ContactLookupCanisterInterface } from "@/ic/idl/contactLookup.idl";
import type { ExtraCanisterInterface } from "@/ic/idl/extra.idl";
import type { MainCanisterInterface } from "@/ic/idl/main.idl";
import type { PublicDataCanisterInterface } from "@/ic/idl/publicData.idl";
import type { ReportsCanisterInterface } from "@/ic/idl/reports.idl";
import {
  generateReadinessReport,
  logReadinessReport,
} from "@/ic/readinessReport";
import { useEffect, useState } from "react";
import { useInternetIdentity } from "./useInternetIdentity";

interface AntiFraudActors {
  mainActor: MainCanisterInterface | null;
  extraActor: ExtraCanisterInterface | null;
  reportsActor: ReportsCanisterInterface | null;
  contactLookupActor: ContactLookupCanisterInterface | null;
  publicDataActor: PublicDataCanisterInterface | null;
  isFetching: boolean;
}

let readinessReportLogged = false;

export function useAntiFraudActors(): AntiFraudActors {
  const { identity, isInitializing } = useInternetIdentity();
  const [mainActor, setMainActor] = useState<MainCanisterInterface | null>(
    null,
  );
  const [extraActor, setExtraActor] = useState<ExtraCanisterInterface | null>(
    null,
  );
  const [reportsActor, setReportsActor] =
    useState<ReportsCanisterInterface | null>(null);
  const [contactLookupActor, setContactLookupActor] =
    useState<ContactLookupCanisterInterface | null>(null);
  const [publicDataActor, setPublicDataActor] =
    useState<PublicDataCanisterInterface | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function initActors() {
      setIsFetching(true);
      try {
        const [main, extra, reports, contactLookup, publicData] =
          await Promise.all([
            createMainActor(identity),
            createExtraActor(identity),
            createReportsActor(identity),
            createContactLookupActor(identity),
            createPublicDataActor(identity),
          ]);

        if (!cancelled) {
          setMainActor(main);
          setExtraActor(extra);
          setReportsActor(reports);
          setContactLookupActor(contactLookup);
          setPublicDataActor(publicData);

          // Log readiness report once per app load
          if (!readinessReportLogged) {
            const report = generateReadinessReport(
              main,
              extra,
              reports,
              contactLookup,
              publicData,
            );
            logReadinessReport(report);
            readinessReportLogged = true;
          }
        }
      } catch (error) {
        console.error("❌ Error initializing actors:", error);
        if (!cancelled) {
          setMainActor(null);
          setExtraActor(null);
          setReportsActor(null);
          setContactLookupActor(null);
          setPublicDataActor(null);

          // Log failure report
          if (!readinessReportLogged) {
            console.group("🔍 AntiFraud Readiness Report");
            console.error("❌ Actor initialization failed:", error);
            console.groupEnd();
            readinessReportLogged = true;
          }
        }
      } finally {
        if (!cancelled) {
          setIsFetching(false);
        }
      }
    }

    if (!isInitializing) {
      initActors();
    }

    return () => {
      cancelled = true;
    };
  }, [identity, isInitializing]);

  return {
    mainActor,
    extraActor,
    reportsActor,
    contactLookupActor,
    publicDataActor,
    isFetching: isFetching || isInitializing,
  };
}
