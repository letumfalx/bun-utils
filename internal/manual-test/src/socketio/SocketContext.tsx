import { createContext, type FunctionComponent } from "preact";
import type { PropsWithChildren } from "preact/compat";
import { useContext, useEffect, useState } from "preact/hooks";
import { io, type Socket } from "socket.io-client";
import type { ClientEmitSocketEvents, ServerEmitSocketEvents } from "../types";
import { useAppendLog } from "./LogContext";

type AppSocket = Socket<ServerEmitSocketEvents, ClientEmitSocketEvents>;

const SocketContext = createContext<null | AppSocket>(null);

export function useSocket() {
  const socket = useContext(SocketContext);
  if (!socket) throw new Error("SocketContextProvider not initialized");
  return socket;
}

export const SocketContextProvider: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const [socket, setSocket] = useState<null | AppSocket>(null);
  const appendToLogs = useAppendLog();

  useEffect(() => {
    const socket = io({
      autoConnect: false,
    });

    setSocket(socket);

    return () => {
      socket.off();
      socket.offAny();
      socket.offAnyOutgoing();
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      const handleConnect = () =>
        appendToLogs({ type: "connected", value: socket.id ?? "unknown ID" });
      const handleDisconnect = (reason: Socket.DisconnectReason) =>
        appendToLogs({
          type: "disconnected",
          value: reason,
        });

      socket.on("connect", handleConnect);
      socket.on("disconnect", handleDisconnect);

      return () => {
        socket.off("connect", handleConnect);
        socket.off("disconnect", handleDisconnect);
      };
    }
  }, [appendToLogs, socket]);

  return (
    <SocketContext value={socket}>{socket ? children : null}</SocketContext>
  );
};
