import { createContext, type FunctionComponent } from "preact";
import type { ContextType, PropsWithChildren } from "preact/compat";
import { useCallback, useContext, useMemo, useState } from "preact/hooks";
import type { Socket } from "socket.io-client";
import type { ClientEmitSocketEvents, ServerEmitSocketEvents } from "../types";

type LogContent =
  | {
      type: "connected";
      value: Socket["id"] & string;
    }
  | {
      type: "disconnected";
      value: Socket.DisconnectReason;
    }
  | {
      type: "sent";
      value: Parameters<ClientEmitSocketEvents["send_to_server"]>;
    }
  | {
      type: "received";
      value: {
        through: "on" | "once";
        params: Parameters<ServerEmitSocketEvents["send_to_client"]>;
      };
    }
  | {
      type: "registered";
      value: "on" | "once";
    }
  | {
      type: "default";
      value: string;
    }
  | {
      type: "error";
      value: Error | string;
    };

const MAX_DISPLAYED_LOGS = 3;

const LogContext = createContext<null | {
  logs: (LogContent & { timestamp: string })[];
  append: (content: LogContent) => void;
}>(null);

type LogContextValue = Exclude<ContextType<typeof LogContext>, null>;

function useLogContext() {
  const logContextValue = useContext(LogContext);
  if (!logContextValue) {
    throw new Error("LogContext not initialized");
  }
  return logContextValue;
}

export function useAppendLog() {
  const { append } = useLogContext();
  return append;
}

export function useLogs() {
  const { logs } = useLogContext();
  return logs;
}

export const LogContextProvider: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const [logs, setLogs] = useState<LogContextValue["logs"]>([]);

  const append: Exclude<ContextType<typeof LogContext>, null>["append"] =
    useCallback(
      (content) => {
        const timestamp = getTimestamp();

        setLogs((logs) => {
          const currentSize = logs.length;

          const newLogs = logs.slice(
            Math.max(0, currentSize - MAX_DISPLAYED_LOGS)
          );
          newLogs.push({ ...content, timestamp });

          return newLogs;
        });
      },

      []
    );

  const contextValue: LogContextValue = useMemo(
    () => ({
      logs,
      append,
    }),
    [logs, append]
  );

  return <LogContext value={contextValue}>{children}</LogContext>;
};

function getTimestamp() {
  const now = new Date();

  return [now.getHours(), now.getMinutes(), now.getSeconds()]
    .map((value) => value.toString().padStart(2, "0"))
    .join(":");
}
