import { withServeStatic } from "@letumfalx/bun-serve-static";

Bun.serve(
  withServeStatic({
    pathPrefix: "/static/",
    publicDirectory: "publicDirectory",
  })({
    fetch: () => new Response(null, { status: 404 }),
  })
);
