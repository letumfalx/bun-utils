import { withSocketIO } from "@letumfalx/bun-serve-socketio";
import { withServeStatic } from "@letumfalx/bun-serve-static";
import { logFn } from "./logFn";
import SOCKET_IO_TEST_PAGE from "./socketio/index.html";
import type { ClientEmitSocketEvents, ServerEmitSocketEvents } from "./types";

const logSocketIO = logFn.extend("socketio");

Bun.serve(
  withServeStatic({
    pathPrefix: "/static/",
    publicDirectory: "publicDirectory",
  })(
    withSocketIO<ClientEmitSocketEvents, ServerEmitSocketEvents>({
      register: (socket) => {
        logSocketIO(`Connected: ${socket.id}`);

        socket.on("send_to_server", (one, two, three) => {
          logSocketIO(
            `Received ${socket.id}: ${[one, two, three].map((value) => JSON.stringify(value)).join(" ")}`
          );

          socket.emit("send_to_client", two, three, one);
        });

        socket.on("disconnect", (reason) => {
          logSocketIO(`Disconnected: ${socket.id} - ${reason}`);
        });
      },
    })({
      fetch: () => new Response(null, { status: 404 }),
      routes: {
        "/socketio": SOCKET_IO_TEST_PAGE,
      },
    })
  )
);
