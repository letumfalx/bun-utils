import type { ComponentProps, FunctionComponent } from "preact";
import { cn } from "../tailwind";

export const Button: FunctionComponent<
  Pick<
    ComponentProps<"button">,
    "children" | "class" | "disabled" | "name" | "onClick" | "type"
  >
> = ({ class: className, ...otherProps }) => {
  return (
    <button
      {...otherProps}
      className={cn(
        "cursor-pointer rounded-full border border-gray-300 bg-gray-200 px-4 py-2 text-lg font-semibold text-gray-700 outline-2 outline-transparent transition-colors focus-within:bg-gray-300 focus-within:outline-2 focus-within:outline-gray-400 hover:bg-gray-300 focus:bg-gray-300 focus:outline-gray-400 disabled:opacity-40",
        className
      )}
    />
  );
};
