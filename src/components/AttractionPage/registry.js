/**
 * Attraction registry — attraction id → { id, route, title, component,
 * content }.
 *
 * This is the single lookup the park-nav router consumes; routing itself is
 * deliberately NOT wired here (owned by the park-nav change). The seven
 * route slugs and the content mapping are locked by the LOR-2423 plan.
 */
import { arcadeAttraction } from "../../data/parkContent/arcade";
import { factoryAttraction } from "../../data/parkContent/factory";
import { graveyardAttraction } from "../../data/parkContent/graveyard";
import { libraryAttraction } from "../../data/parkContent/library";
import { hardwareAttraction } from "../../data/parkContent/hardware";
import { launchesAttraction } from "../../data/parkContent/launches";
import { fortuneAttraction } from "../../data/parkContent/fortune";

import AgentArcadePage from "./AgentArcadePage";
import FactoryPage from "./FactoryPage";
import GraveyardPage from "./GraveyardPage";
import LibraryPage from "./LibraryPage";
import HardwarePage from "./HardwarePage";
import LaunchesPage from "./LaunchesPage";
import FortunePage from "./FortunePage";

export const attractions = {
  arcade: {
    id: arcadeAttraction.id,
    route: arcadeAttraction.route,
    title: arcadeAttraction.title,
    component: AgentArcadePage,
    content: arcadeAttraction,
  },
  factory: {
    id: factoryAttraction.id,
    route: factoryAttraction.route,
    title: factoryAttraction.title,
    component: FactoryPage,
    content: factoryAttraction,
  },
  graveyard: {
    id: graveyardAttraction.id,
    route: graveyardAttraction.route,
    title: graveyardAttraction.title,
    component: GraveyardPage,
    content: graveyardAttraction,
  },
  library: {
    id: libraryAttraction.id,
    route: libraryAttraction.route,
    title: libraryAttraction.title,
    component: LibraryPage,
    content: libraryAttraction,
  },
  hardware: {
    id: hardwareAttraction.id,
    route: hardwareAttraction.route,
    title: hardwareAttraction.title,
    component: HardwarePage,
    content: hardwareAttraction,
  },
  launches: {
    id: launchesAttraction.id,
    route: launchesAttraction.route,
    title: launchesAttraction.title,
    component: LaunchesPage,
    content: launchesAttraction,
  },
  fortune: {
    id: fortuneAttraction.id,
    route: fortuneAttraction.route,
    title: fortuneAttraction.title,
    component: FortunePage,
    content: fortuneAttraction,
  },
};

// The seven locked attraction slugs, in park-map order.
export const attractionRoutes = [
  "/arcade",
  "/factory",
  "/graveyard",
  "/library",
  "/hardware",
  "/launches",
  "/fortune",
];

export const getAttraction = (id) => attractions[id] ?? null;
