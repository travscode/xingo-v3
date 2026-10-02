import { query } from "./_generated/server";
import { requirePlatformAdmin } from "./model/auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requirePlatformAdmin(ctx);
    return ctx.db.query("organizations").collect();
  },
});
