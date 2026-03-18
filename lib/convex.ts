export function getConvexConfig() {
  return {
    deployment: process.env.CONVEX_DEPLOYMENT ?? "",
    url: process.env.NEXT_PUBLIC_CONVEX_URL ?? "",
    deployKey: process.env.CONVEX_DEPLOY_KEY ?? "",
  };
}
