import {
  Config,
  NetworkType,
  InstallAgentsHapps,
  TransportConfigType,
} from "@holochain/tryorama";

import { Installables } from "./types";
import path from "path";
import invitations from "./zomes/chess";

// QUIC
const network = {
  network_type: NetworkType.QuicBootstrap,
  transport_pool: [{type: TransportConfigType.Quic}],
  bootstrap_service: "https://bootstrap-staging.holo.host/",
};

const config = Config.gen();

const scores_zome = path.join("../workdir/dna/Invitations.dna");


const installAgents: InstallAgentsHapps = [[[scores_zome]], [[scores_zome]]];




invitations( config, installAgents);
