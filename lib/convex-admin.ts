import { getConvexConfig } from "@/lib/convex";

export async function runConvexMutation(path: string, args: Record<string, unknown>) {
  const { url, deployKey } = getConvexConfig();

  if (!url || !deployKey) {
    throw new Error("Convex deployment URL or deploy key is missing");
  }

  const response = await fetch(`${url}/api/mutation`, {
    method: "POST",
    headers: {
      Authorization: `Convex ${deployKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      path,
      args,
      format: "json",
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Convex mutation failed: ${message}`);
  }

  return response.json();
}
