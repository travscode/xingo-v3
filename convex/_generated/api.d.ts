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
import type * as avatars from "../avatars.js";
import type * as billing from "../billing.js";
import type * as billingData from "../billingData.js";
import type * as catalog from "../catalog.js";
import type * as connect from "../connect.js";
import type * as connectData from "../connectData.js";
import type * as content from "../content.js";
import type * as content_australiaPack from "../content/australiaPack.js";
import type * as content_examsPack from "../content/examsPack.js";
import type * as crons from "../crons.js";
import type * as emailActions from "../emailActions.js";
import type * as emails from "../emails.js";
import type * as http from "../http.js";
import type * as jobs from "../jobs.js";
import type * as marketplace from "../marketplace.js";
import type * as marketplaceActions from "../marketplaceActions.js";
import type * as migrations from "../migrations.js";
import type * as model_auth from "../model/auth.js";
import type * as model_courses from "../model/courses.js";
import type * as model_entitlements from "../model/entitlements.js";
import type * as model_grading from "../model/grading.js";
import type * as model_scenario from "../model/scenario.js";
import type * as modules from "../modules.js";
import type * as organizations from "../organizations.js";
import type * as practice from "../practice.js";
import type * as practiceActions from "../practiceActions.js";
import type * as scenarios from "../scenarios.js";
import type * as seed from "../seed.js";
import type * as seedData from "../seedData.js";
import type * as sessions from "../sessions.js";
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
  avatars: typeof avatars;
  billing: typeof billing;
  billingData: typeof billingData;
  catalog: typeof catalog;
  connect: typeof connect;
  connectData: typeof connectData;
  content: typeof content;
  "content/australiaPack": typeof content_australiaPack;
  "content/examsPack": typeof content_examsPack;
  crons: typeof crons;
  emailActions: typeof emailActions;
  emails: typeof emails;
  http: typeof http;
  jobs: typeof jobs;
  marketplace: typeof marketplace;
  marketplaceActions: typeof marketplaceActions;
  migrations: typeof migrations;
  "model/auth": typeof model_auth;
  "model/courses": typeof model_courses;
  "model/entitlements": typeof model_entitlements;
  "model/grading": typeof model_grading;
  "model/scenario": typeof model_scenario;
  modules: typeof modules;
  organizations: typeof organizations;
  practice: typeof practice;
  practiceActions: typeof practiceActions;
  scenarios: typeof scenarios;
  seed: typeof seed;
  seedData: typeof seedData;
  sessions: typeof sessions;
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
