import type { FunctionComponent } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";
import { Button } from "../components/Button";
import type { ClientEmitSocketEvents } from "../types";
import { useAppendLog } from "./LogContext";
import { useSocket } from "./SocketContext";

const CONNECTED_DISABLED_ACTIONS = ["connected"];
const DISCONNECTED_DISABLED_ACTIONS = ["disconnect", "emit"];

export const Actions: FunctionComponent = () => {
  const socket = useSocket();
  const appendToLogs = useAppendLog();

  const buttons: {
    name: string;
    content: string;
    onClick: () => void;
  }[] = useMemo(
    () => [
      {
        name: "connect",
        content: "Connect",
        onClick: () => socket.connect(),
      },
      {
        name: "disconnect",
        content: "Disconnect",
        onClick: () => socket.disconnect(),
      },
      {
        name: "emit",
        content: "Emit",
        onClick: () => {
          const params: Parameters<ClientEmitSocketEvents["send_to_server"]> = [
            Math.floor(Math.random() * 1_000_000),
            Math.random() < 0.5,
            crypto.randomUUID(),
          ];

          socket.emit("send_to_server", ...params);
          appendToLogs({ type: "sent", value: params });
        },
      },
      {
        name: "on",
        content: "On",
        onClick: () => {
          socket.on("send_to_client", (...args) => {
            appendToLogs({
              type: "received",
              value: { through: "on", params: args },
            });
          });

          appendToLogs({
            type: "registered",
            value: "on",
          });
        },
      },
      {
        name: "once",
        content: "Once",
        onClick: () => {
          socket.once("send_to_client", (...args) => {
            appendToLogs({
              type: "received",
              value: { through: "once", params: args },
            });
          });

          appendToLogs({
            type: "registered",
            value: "once",
          });
        },
      },
      {
        name: "off",
        content: "Off",
        onClick: () => {
          socket.off("send_to_client");

          appendToLogs({
            type: "default",
            value: "Removed all registered event handlers.",
          });
        },
      },
    ],
    [appendToLogs, socket]
  );

  const [disabledList, setDisabledList] = useState<string[]>([]);

  useEffect(() => {
    if (socket) {
      setDisabledList(
        socket.connected
          ? CONNECTED_DISABLED_ACTIONS
          : DISCONNECTED_DISABLED_ACTIONS
      );

      const handleConnect = () => setDisabledList(CONNECTED_DISABLED_ACTIONS);
      const handleDisconnect = () =>
        setDisabledList(DISCONNECTED_DISABLED_ACTIONS);

      socket.on("connect", handleConnect);
      socket.on("disconnect", handleDisconnect);

      return () => {
        socket.off("connect", handleConnect);
        socket.off("disconnect", handleDisconnect);
      };
    }
  }, [socket]);

  return (
    <div class="grid shrink-0 grow-0 grid-cols-3 gap-4">
      {buttons.map(({ name, content, onClick }) => (
        <Button
          disabled={disabledList.includes(name)}
          key={name}
          name={name}
          onClick={onClick}
        >
          {content}
        </Button>
      ))}
    </div>
  );
};
