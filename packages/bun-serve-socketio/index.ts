import { Server as Engine, type WebSocketData } from "@socket.io/bun-engine";
import { Server, type Socket } from "socket.io";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GenericFunction = (...args: any[]) => any;

export type EventMap = {
  [key: string]: GenericFunction;
};

export type RegisterSocketEventFunction<
  TListenEvents extends EventMap = EventMap,
  TEmitEvents extends EventMap = EventMap,
> = (
  socket: Socket<TListenEvents, TEmitEvents>,
  server: Server<TListenEvents, TEmitEvents>
) => void;

type BaseWithSocketIOOPtions = {
  socketIO?: undefined | ConstructorParameters<typeof Engine>[0];
};

export type NamespacedWithSocketIOOptions<
  TListenEvents extends EventMap = EventMap,
  TEmitEvents extends EventMap = EventMap,
  TNamespace extends string = string,
> = BaseWithSocketIOOPtions & {
  register:
    | Record<
        TNamespace,
        RegisterSocketEventFunction<TListenEvents, TEmitEvents>
      >
    | Map<
        TNamespace | RegExp,
        RegisterSocketEventFunction<TListenEvents, TEmitEvents>
      >;
};

export type WithSocketIOOptions<
  TListenEvents extends EventMap = EventMap,
  TEmitEvents extends EventMap = EventMap,
> = BaseWithSocketIOOPtions & {
  register: RegisterSocketEventFunction<TListenEvents, TEmitEvents>;
};

export interface WithSocketIOReturnType {
  <TWebSocketData, TRoute extends string = string>(
    serveOptions?: undefined | Bun.Serve.Options<TWebSocketData, TRoute>
  ): Bun.Serve.Options<TWebSocketData | WebSocketData, TRoute>;
}

/**
 * Creates a Socket.IO server integrated with Bun's serve options.
 *
 * @example
 *   ```ts
 *   // Single namespace example
 *   Bun.serve(
 *      withSocketIO({
 *        register: (socket, io) => {
 *          socket.on('message', (data) => socket.emit('response', data));
 *        }
 *      })({
 *        fetch: () => new Response(null, { status: 404 }),
 *      })
 *   );
 *
 *   // Multiple namespaces example
 *   Bun.serve(
 *      withSocketIO({
 *        register: {
 *          '/chat': (socket, io) => { ... },
 *          '/notifications': (socket, io) => { ... }
 *        }
 *      })({
 *        fetch: () => new Response(null, { status: 404 }),
 *      })
 *   );
 *   ```;
 *
 * @param options - Configuration options for Socket.IO integration
 * @param options.register - Event registration function(s). Can be a single
 *   function for the default namespace, or a Record/Map of namespace-specific
 *   functions
 * @param options.socketIO - Optional Socket.IO engine configuration
 * @returns A function that accepts Bun serve options and returns enhanced serve
 *   options with Socket.IO support
 */
export function withSocketIO<
  TListenEvents extends EventMap = EventMap,
  TEmitEvents extends EventMap = EventMap,
  TNamespace extends string = string,
>(
  options: NamespacedWithSocketIOOptions<TListenEvents, TEmitEvents, TNamespace>
): WithSocketIOReturnType;
export function withSocketIO<
  TListenEvents extends EventMap = EventMap,
  TEmitEvents extends EventMap = EventMap,
>(
  options: WithSocketIOOptions<TListenEvents, TEmitEvents>
): WithSocketIOReturnType;
export function withSocketIO<
  TListenEvents extends EventMap = EventMap,
  TEmitEvents extends EventMap = EventMap,
  TNamespace extends string = string,
>(
  options:
    | WithSocketIOOptions<TListenEvents, TEmitEvents>
    | NamespacedWithSocketIOOptions<TListenEvents, TEmitEvents, TNamespace>
): WithSocketIOReturnType {
  const { register, socketIO: socketIOOptions = {} } = options;

  return function <TWebSocketData, TRoute extends string = string>(
    serveOptions?: undefined | Bun.Serve.Options<TWebSocketData, TRoute>
  ): Bun.Serve.Options<TWebSocketData | WebSocketData, TRoute> {
    const io = new Server<TListenEvents, TEmitEvents>();
    const path = fixInputPath(socketIOOptions.path ?? "/socket.io/");
    const engine = new Engine({
      ...socketIOOptions,
      path,
    });
    io.bind(engine);

    if (typeof register === "function") {
      io.on("connection", (socket) => register(socket, io));
    } else {
      const list =
        register instanceof Map
          ? register.entries()
          : (Object.entries(register) as [
              TNamespace,
              RegisterSocketEventFunction<TListenEvents, TEmitEvents>,
            ][]);

      for (const [namespace, registerFn] of list) {
        io.of(namespace).on("connection", (socket) => registerFn(socket, io));
      }
    }

    const { fetch: ioFetch, ...ioHanders } = engine.handler();

    return {
      ...serveOptions,
      ...ioHanders,
      fetch: async (request, server) => {
        const url = new URL(request.url);

        if (url.pathname.startsWith(path)) {
          return ioFetch(request, server);
        }

        if (serveOptions?.fetch) {
          return serveOptions.fetch.call(server, request, server);
        }
      },
    } as Bun.Serve.Options<TWebSocketData | WebSocketData, TRoute>;
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
