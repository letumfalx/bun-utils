import type { FunctionComponent } from "preact";
import { Actions } from "./Actions";
import { LogContextProvider } from "./LogContext";
import { LogViewer } from "./LogViewer";
import { SocketContextProvider } from "./SocketContext";

export const App: FunctionComponent = () => {
  return (
    <div class="mx-auto flex h-screen w-full max-w-lg flex-col gap-4 py-4">
      <LogContextProvider>
        <LogViewer />
        <SocketContextProvider>
          <Actions />
        </SocketContextProvider>
      </LogContextProvider>
    </div>
  );
};
