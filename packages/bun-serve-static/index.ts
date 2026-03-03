import { join, resolve } from "path";

export type WithServeStaticOptions = {
  /**
   * The path prefix for static file serving. Use this if you need to separate
   * the static part of your app using a path prefix. For example, `/static` or
   * `/assets/`. Automatically normalized to start and end with `/`.
   *
   * @default ""
   */
  pathPrefix?: undefined | string;
  /**
   * The local path where static files are served from. Can be absolute or
   * relative to the current working directory.
   *
   * @default `${process.cwd()}/public`
   */
  publicDirectory?: undefined | string;
};

/**
 * Adds static file serving middleware to Bun's server options.
 *
 * This higher-order function wraps Bun's serve options to intercept GET
 * requests and serve static files from the specified public directory. If a
 * directory is requested (pathname ends with `/`), it appends `index.html`
 * automatically. If the file does not exist or the request method is not GET,
 * it falls back to the original fetch handler.
 *
 * @example
 *   import { withServeStatic } from "@letumfalx/bun-serve-static";
 *
 *   Bun.serve(
 *     withServeStatic({ pathPrefix: "/static/", publicDirectory: "./dist" })(
 *       {
 *         fetch: (request) => new Response("Not found", { status: 404 }),
 *       }
 *     )
 *   );
 *
 * @param options - Configuration options for static file serving.
 * @returns A function that wraps Bun.Serve.Options with static file handling.
 */
export function withServeStatic(
  options: undefined | WithServeStaticOptions = {}
) {
  const {
    pathPrefix: pathPrefixOption = "",
    publicDirectory = `${resolve(process.cwd(), "public")}`,
  } = options;

  const pathPrefix = fixInputPath(pathPrefixOption);

  return function <TWebSocketData, TRoute extends string = string>(
    serveOptions?: undefined | Bun.Serve.Options<TWebSocketData, TRoute>
  ): Bun.Serve.Options<TWebSocketData, TRoute> {
    return {
      ...serveOptions,
      fetch: async (request, server) => {
        if (request.method === "GET") {
          const url = new URL(request.url);

          let pathName = url.pathname;

          if (pathName.startsWith(pathPrefix)) {
            if (pathName.endsWith("/")) {
              // adds `index.html` if accessing a directory
              pathName += "index.html";
            }

            // removes prefix
            pathName = pathName.slice(pathPrefix.length);

            const filePath = join(publicDirectory, pathName);
            const file = Bun.file(filePath);

            if (await file.exists()) {
              return new Response(file);
            }
          }
        }

        if (serveOptions?.fetch) {
          return serveOptions.fetch.call(server, request, server);
        }

        // we will let bun handle fallback here
      },
    } as Bun.Serve.Options<TWebSocketData, TRoute>;
  };
}

function fixInputPath(path: string): string {
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }

  if (!path.endsWith("/")) {
    path = `${path}/`;
  }

  return path;
}
