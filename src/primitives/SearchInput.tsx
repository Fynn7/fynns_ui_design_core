import type { ForwardedRef, InputHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { SearchIcon } from "./icons";

export type SearchInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  /** Leading icon node; defaults to a magnifier. */
  leadingIcon?: ReactNode;
  /** Wrapper class for the search shell. */
  wrapClassName?: string;
};

/** Search input with a leading icon. `.fynns-search-*`. */
export const SearchInput = forwardRef(function SearchInput(
  { leadingIcon, wrapClassName, className, ...rest }: SearchInputProps,
  ref: ForwardedRef<HTMLInputElement>,
) {
  return (
    <div className={["fynns-search", wrapClassName ?? ""].filter(Boolean).join(" ")}>
      <span className="fynns-search-leading" aria-hidden="true">
        {leadingIcon ?? <SearchIcon size={16} />}
      </span>
      <input
        {...rest}
        ref={ref}
        type="search"
        className={["fynns-input", "fynns-search-input", className ?? ""]
          .filter(Boolean)
          .join(" ")}
      />
    </div>
  );
});
