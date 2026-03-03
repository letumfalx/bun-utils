# @letumfalx/bun-serve-static

A middleware for Bun.serve() that adds static file serving capabilities to your server configuration.

## Features

- 🚀 Middleware for Bun.serve() to add static file serving
- 📁 Serves files from a configurable local directory
- ⚡ Minimal dependencies and easy integration
- 🔧 Simple, flexible configuration options

## Installation

```bash
bun add @letumfalx/bun-serve-static
```

## Usage

```ts
import withServeStatic from "@letumfalx/bun-serve-static";

Bun.serve(
  withServeStatic({ pathPrefix: "/static/", publicDirectory: './dist' })({
    fetch: () => new Response(null, { status: 404 });
  })
);
```

## Options

### `publicDirectory` (_Optional_)

> **Type:** `string`
>
> **Default:** `${process.cwd()}/public`

The local path where static files are served from. Can be absolute or relative to the current working directory.

### `pathPrefix` (_Optional_)

> **Type:** `string`
>
> **Default:** `""`

The path prefix for static file serving. Use this if you need to separate the static part of your app using a path prefix. For example, `/static` or `/assets/`. Automatically normalized to start and end with `/`.

## License

MIT
