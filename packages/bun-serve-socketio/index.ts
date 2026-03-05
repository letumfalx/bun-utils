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
  /** The additional SocketIO server options. */
  socketIO?: undefined | ConstructorParameters<typeof Engine>[0];
};

export type NamespacedWithSocketIOOptions<
  TListenEvents extends EventMap = EventMap,
  TEmitEvents extends EventMap = EventMap,
  TNamespace extends string = string,
> = BaseWithSocketIOOPtions & {
  /** Registers multiple namespace. */
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
  /** Register to the default namespace. */
  register: RegisterSocketEventFunction<TListenEvents, TEmitEvents>;
};

export interface WithSocketIOReturnType {
  <TWebSocketData, TRoute extends string = string>(
    serveOptions?: undefined | Bun.Serve.Options<TWebSocketData, TRoute>
  ): Bun.Serve.Options<TWebSocketData | WebSocketData, TRoute>;
}

/**
 * Integrates a Socket.IO server with Bun's HTTP server options.
 *
 * @example
 *   ```ts
 *   Bun.serve(
 *     withSocketIO({
 *       register: (socket, io) => {
 *         socket.on('message', (data) => {
 *           socket.emit('response', data);
 *         });
 *       }
 *     })({
 *       fetch: () => new Response(null, { status: 404 }),
 *     })
 *   );
 *   ```;
 *
 * @param options - Configuration for Socket.IO integration, including event
 *   registration.
 * @returns A function that augments Bun.Serve.Options with Socket.IO support.
 */
export function withSocketIO<
  TListenEvents extends EventMap = EventMap,
  TEmitEvents extends EventMap = EventMap,
>(
  options: WithSocketIOOptions<TListenEvents, TEmitEvents>
): WithSocketIOReturnType;
/**
 * Integrates a Socket.IO server with Bun's HTTP server options, supporting
 * multiple namespaces.
 *
 * @example
 *   ```ts
 *   Bun.serve(
 *     withSocketIO({
 *       register: {
 *         '/chat': (socket, io) => { ... },
 *         '/notifications': (socket, io) => { ... }
 *       }
 *     })({
 *       fetch: () => new Response(null, { status: 404 }),
 *     })
 *   );
 *   ```;
 *
 * @param options - Configuration for Socket.IO integration, allowing
 *   registration of event handlers for multiple namespaces.
 * @returns A function that augments Bun.Serve.Options with Socket.IO support
 *   for the specified namespaces.
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
