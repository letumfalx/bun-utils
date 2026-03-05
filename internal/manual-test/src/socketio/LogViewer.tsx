import { clsx } from "clsx";
import type { FunctionComponent } from "preact";
import { useMemo } from "preact/hooks";
import { useLogs } from "./LogContext";

export const LogViewer: FunctionComponent = () => {
  const logs = useLogs();

  return (
    <div class="flex flex-1 flex-col items-stretch gap-2 overflow-y-auto rounded-lg border p-2">
      {logs.map(({ timestamp, ...log }, index) => (
        <div
          class="flex flex-row gap-2 rounded-2xl border-l-8 border-l-transparent px-1.5 py-2 first:mt-auto last:bg-gray-100"
          key={index}
        >
          <div class="shrink-0 grow-0 font-semibold whitespace-nowrap">
            {timestamp}:
          </div>
          {log.type === "connected" && <Connected value={log.value} />}
          {log.type === "disconnected" && <Disconnected value={log.value} />}
          {log.type === "registered" && <Registered value={log.value} />}
          {log.type === "received" && <Received value={log.value} />}
          {log.type === "sent" && <Sent value={log.value} />}
          {log.type === "error" && <Error value={log.value} />}
          {log.type === "default" && <Default value={log.value} />}
        </div>
      ))}
    </div>
  );
};

type MessageProps<
  TDiscriminator extends Pick<ReturnType<typeof useLogs>[number], "type">,
> = {
  class?: undefined | string;
  value: Extract<ReturnType<typeof useLogs>[number], TDiscriminator>["value"];
};

const Connected: FunctionComponent<MessageProps<{ type: "connected" }>> = ({
  class: className,
  value,
}) => {
  return (
    <div class={clsx("text-green-600", className)}>
      Connected to the server: <span class="font-bold">{value}</span>
    </div>
  );
};

const Disconnected: FunctionComponent<
  MessageProps<{ type: "disconnected" }>
> = ({ class: className, value }) => {
  return (
    <div class={clsx("text-yellow-600", className)}>
      Disconnected from the server: <span class="font-bold">{value}</span>
    </div>
  );
};

const Registered: FunctionComponent<MessageProps<{ type: "registered" }>> = ({
  class: className,
  value,
}) => {
  return (
    <div class={clsx("text-gray-500", className)}>
      Registered an <span class="font-bold uppercase">{value}</span> event
      handler.
    </div>
  );
};

const Received: FunctionComponent<MessageProps<{ type: "received" }>> = ({
  class: className,
  value: { params, through },
}) => {
  const displayValue = useMemo(
    () => JSON.stringify(params, undefined, "\t"),
    [params]
  );

  return (
    <div class={clsx("flex flex-col text-blue-700", className)}>
      <span>
        Received Event from server through{" "}
        <span class="font-bold uppercase">{through}</span>:
      </span>
      <code class="overflow-x-auto rounded-sm bg-gray-50 p-1 whitespace-pre">
        {displayValue}
      </code>
    </div>
  );
};

const Sent: FunctionComponent<MessageProps<{ type: "sent" }>> = ({
  class: className,
  value,
}) => {
  const displayValue = useMemo(
    () => JSON.stringify(value, undefined, "\t"),
    [value]
  );

  return (
    <div class={clsx("flex flex-col gap-1 text-orange-500", className)}>
      <span class="shrink-0">Sent event to server:</span>
      <code class="overflow-x-auto rounded-sm bg-gray-50 p-1 whitespace-pre">
        {displayValue}
      </code>
    </div>
  );
};

const Error: FunctionComponent<MessageProps<{ type: "error" }>> = ({
  class: className,
  value,
}) => {
  const message = typeof value === "string" ? value : value.message;

  return (
    <div class={clsx("text-red-500", className)}>
      Error: <span class="font-semibold">{message}</span>
    </div>
  );
};

const Default: FunctionComponent<MessageProps<{ type: "default" }>> = ({
  class: className,
  value,
}) => <div class={clsx("text-gray-700", className)}>{value}</div>;
