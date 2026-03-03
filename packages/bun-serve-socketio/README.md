# @letumfalx/bun-serve-socketio

`@letumfalx/bun-serve-socketio` is a lightweight wrapper that adds [Socket.IO](https://socket.io/) server functionality to your existing [`Bun.serve`](https://bun.sh/docs/runtime/http/server) options. It leverages [`@socket.io/bun-engine`](https://www.npmjs.com/package/@socket.io/bun-engine) to provide real-time, bidirectional communication capabilities in Bun-powered HTTP servers.

## Features

- Seamlessly integrates Socket.IO with Bun's native HTTP server.
- Simple API: wrap your existing `bun.serve` options to enable WebSocket support.
- Powered by the official `@socket.io/bun-engine`.

## Installation

```sh
bun add socket.io @socket.io/bun-engine @letumfalx/bun-serve-socketio
```

## Usage

```js
import { withSocketIO } from "@letumfalx/bun-serve-socketio";

// Single namespace example
Bun.serve(
  withSocketIO({
    register: (socket, io) => {
      socket.on("message", (data) => socket.emit("response", data));
    },
    socketIO: {
      maxHttpBufferSize: 1024,
    }
  })({
    fetch: () => new Response(null, { status: 404 }),
  })
);

// Multiple namespaces example
Bun.serve(
  withSocketIO({
    register: {
      '/chat': (socket, io) => { ... },
      '/notifications': (socket, io) => { ... }
    },
    socketIO: {
      maxHttpBufferSize: 1024,
    }
  })({
    fetch: () => new Response(null, { status: 404 }),
  })
);
```

## License

MIT
