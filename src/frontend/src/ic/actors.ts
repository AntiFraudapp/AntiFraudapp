import { Actor, HttpAgent } from "@dfinity/agent";
import { getCanisterId } from "./canisterIds";
import {
  type ContactLookupCanisterInterface,
  contactLookupIdlFactory,
} from "./idl/contactLookup.idl";
import {
  type DenunciasCanisterInterface,
  denunciasIdlFactory,
} from "./idl/denuncias.idl";
import { type ExtraCanisterInterface, extraIdlFactory } from "./idl/extra.idl";
import {
  type LocationCanisterInterface,
  locationIdlFactory,
} from "./idl/location.idl";
import { type MainCanisterInterface, mainIdlFactory } from "./idl/main.idl";
import {
  type PublicDataCanisterInterface,
  publicDataIdlFactory,
} from "./idl/publicData.idl";
import {
  type ReportsCanisterInterface,
  reportsIdlFactory,
} from "./idl/reports.idl";

// Always use IC mainnet host
const host = "https://icp0.io";

export async function createAgent(identity?: any): Promise<HttpAgent> {
  const agent = new HttpAgent({
    host,
    identity,
  });

  // Note: fetchRootKey is never called in production to avoid security issues
  // Local development should use icp0.io host as well

  return agent;
}

export async function createMainActor(
  identity?: any,
): Promise<MainCanisterInterface> {
  const agent = await createAgent(identity);
  return Actor.createActor<MainCanisterInterface>(mainIdlFactory as any, {
    agent,
    canisterId: getCanisterId("main"),
  });
}

export async function createExtraActor(
  identity?: any,
): Promise<ExtraCanisterInterface> {
  const agent = await createAgent(identity);
  return Actor.createActor<ExtraCanisterInterface>(extraIdlFactory, {
    agent,
    canisterId: getCanisterId("extra"),
  });
}

export async function createReportsActor(
  identity?: any,
): Promise<ReportsCanisterInterface> {
  const agent = await createAgent(identity);
  return Actor.createActor<ReportsCanisterInterface>(reportsIdlFactory, {
    agent,
    canisterId: getCanisterId("reports"),
  });
}

export async function createDenunciasActor(
  identity?: any,
): Promise<DenunciasCanisterInterface> {
  const agent = await createAgent(identity);
  return Actor.createActor<DenunciasCanisterInterface>(
    denunciasIdlFactory as any,
    {
      agent,
      canisterId: getCanisterId("denuncias"),
    },
  );
}

export async function createLocationActor(
  identity?: any,
): Promise<LocationCanisterInterface> {
  const agent = await createAgent(identity);
  return Actor.createActor<LocationCanisterInterface>(
    locationIdlFactory as any,
    {
      agent,
      canisterId: getCanisterId("location"),
    },
  );
}

export async function createContactLookupActor(
  identity?: any,
): Promise<ContactLookupCanisterInterface> {
  const agent = await createAgent(identity);
  return Actor.createActor<ContactLookupCanisterInterface>(
    contactLookupIdlFactory,
    {
      agent,
      canisterId: getCanisterId("contactLookup"),
    },
  );
}

export async function createPublicDataActor(
  identity?: any,
): Promise<PublicDataCanisterInterface> {
  const agent = await createAgent(identity);
  return Actor.createActor<PublicDataCanisterInterface>(publicDataIdlFactory, {
    agent,
    canisterId: getCanisterId("publicData"),
  });
}
