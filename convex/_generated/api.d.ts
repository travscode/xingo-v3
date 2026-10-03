/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as adminActions from "../adminActions.js";
import type * as adminUsage from "../adminUsage.js";
import type * as avatars from "../avatars.js";
import type * as billing from "../billing.js";
import type * as billingData from "../billingData.js";
import type * as catalog from "../catalog.js";
import type * as connect from "../connect.js";
import type * as connectData from "../connectData.js";
import type * as content from "../content.js";
import type * as content_australiaPack from "../content/australiaPack.js";
import type * as content_examsPack from "../content/examsPack.js";
import type * as content_originals_bothSides from "../content/originals/bothSides.js";
import type * as content_originals_data from "../content/originals/data.js";
import type * as content_originals_firstShift from "../content/originals/firstShift.js";
import type * as content_originals_freshStartStudio from "../content/originals/freshStartStudio.js";
import type * as content_originals_kindHands from "../content/originals/kindHands.js";
import type * as content_originals_lanewayCoffeeClub from "../content/originals/lanewayCoffeeClub.js";
import type * as content_originals_lastOrdersAcademy from "../content/originals/lastOrdersAcademy.js";
import type * as content_originals_overTheFence from "../content/originals/overTheFence.js";
import type * as content_originals_sayHiFirst from "../content/originals/sayHiFirst.js";
import type * as content_originals_schoolGateStudio from "../content/originals/schoolGateStudio.js";
import type * as content_originals_smokoStudio from "../content/originals/smokoStudio.js";
import type * as content_originals_types from "../content/originals/types.js";
import type * as content_originals_ugc from "../content/originals/ugc.js";
import type * as creators from "../creators.js";
import type * as crons from "../crons.js";
import type * as emailActions from "../emailActions.js";
import type * as emails from "../emails.js";
import type * as http from "../http.js";
import type * as jobs from "../jobs.js";
import type * as labActions from "../labActions.js";
import type * as marketplace from "../marketplace.js";
import type * as marketplaceActions from "../marketplaceActions.js";
import type * as marketplaceAdmin from "../marketplaceAdmin.js";
import type * as migrations from "../migrations.js";
import type * as model_auth from "../model/auth.js";
import type * as model_courses from "../model/courses.js";
import type * as model_entitlements from "../model/entitlements.js";
import type * as model_grading from "../model/grading.js";
import type * as model_notify from "../model/notify.js";
import type * as model_scenario from "../model/scenario.js";
import type * as model_usageRollups from "../model/usageRollups.js";
import type * as modules from "../modules.js";
import type * as onboarding from "../onboarding.js";
import type * as organizations from "../organizations.js";
import type * as originals from "../originals.js";
import type * as practice from "../practice.js";
import type * as practiceActions from "../practiceActions.js";
import type * as ratings from "../ratings.js";
import type * as scenarios from "../scenarios.js";
import type * as seed from "../seed.js";
import type * as seedData from "../seedData.js";
import type * as sessions from "../sessions.js";
import type * as transactional from "../transactional.js";
import type * as usage from "../usage.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  adminActions: typeof adminActions;
  adminUsage: typeof adminUsage;
  avatars: typeof avatars;
  billing: typeof billing;
  billingData: typeof billingData;
  catalog: typeof catalog;
  connect: typeof connect;
  connectData: typeof connectData;
  content: typeof content;
  "content/australiaPack": typeof content_australiaPack;
  "content/examsPack": typeof content_examsPack;
  "content/originals/bothSides": typeof content_originals_bothSides;
  "content/originals/data": typeof content_originals_data;
  "content/originals/firstShift": typeof content_originals_firstShift;
  "content/originals/freshStartStudio": typeof content_originals_freshStartStudio;
  "content/originals/kindHands": typeof content_originals_kindHands;
  "content/originals/lanewayCoffeeClub": typeof content_originals_lanewayCoffeeClub;
  "content/originals/lastOrdersAcademy": typeof content_originals_lastOrdersAcademy;
  "content/originals/overTheFence": typeof content_originals_overTheFence;
  "content/originals/sayHiFirst": typeof content_originals_sayHiFirst;
  "content/originals/schoolGateStudio": typeof content_originals_schoolGateStudio;
  "content/originals/smokoStudio": typeof content_originals_smokoStudio;
  "content/originals/types": typeof content_originals_types;
  "content/originals/ugc": typeof content_originals_ugc;
  creators: typeof creators;
  crons: typeof crons;
  emailActions: typeof emailActions;
  emails: typeof emails;
  http: typeof http;
  jobs: typeof jobs;
  labActions: typeof labActions;
  marketplace: typeof marketplace;
  marketplaceActions: typeof marketplaceActions;
  marketplaceAdmin: typeof marketplaceAdmin;
  migrations: typeof migrations;
  "model/auth": typeof model_auth;
  "model/courses": typeof model_courses;
  "model/entitlements": typeof model_entitlements;
  "model/grading": typeof model_grading;
  "model/notify": typeof model_notify;
  "model/scenario": typeof model_scenario;
  "model/usageRollups": typeof model_usageRollups;
  modules: typeof modules;
  onboarding: typeof onboarding;
  organizations: typeof organizations;
  originals: typeof originals;
  practice: typeof practice;
  practiceActions: typeof practiceActions;
  ratings: typeof ratings;
  scenarios: typeof scenarios;
  seed: typeof seed;
  seedData: typeof seedData;
  sessions: typeof sessions;
  transactional: typeof transactional;
  usage: typeof usage;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
