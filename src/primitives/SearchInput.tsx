import type { ForwardedRef, InputHTMLAttributes, ReactNode } from "react";
import { forwardRef, useId } from "react";
import { SearchIcon } from "./icons";

export type SearchInputSize = "sm" | "md";

export type SearchInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> & {
  /** Leading icon node; defaults to a magnifier. */
  leadingIcon?: ReactNode;
  trailing?: ReactNode;
  /** Wrapper class for the search shell. */
  wrapClassName?: string;
  invalid?: boolean;
  size?: SearchInputSize;
  supportingText?: ReactNode;
  errorText?: ReactNode;
};

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** Search input with a leading icon. `.fynns-search-*`. */
export const SearchInput = forwardRef(function SearchInput(
  {
    leadingIcon,
    trailing,
    wrapClassName,
    className,
    invalid = false,
    size = "md",
    supportingText,
    errorText,
    id,
    "aria-describedby": ariaDescribedBy,
    ...rest
  }: SearchInputProps,
  ref: ForwardedRef<HTMLInputElement>,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const hintId = `${fieldId}-hint`;
  const isInvalid = invalid || !!errorText;
  const hint = errorText ?? supportingText;

  const shell = (
    <div
      className={join(
        "fynns-search",
        size === "sm" && "fynns-search--sm",
        isInvalid && "fynns-search--invalid",
        wrapClassName,
      )}
    >
      <span className="fynns-search-leading" aria-hidden="true">
        {leadingIcon ?? <SearchIcon size={16} />}
      </span>
      <input
        {...rest}
        id={fieldId}
        ref={ref}
        type="search"
        aria-invalid={isInvalid || undefined}
        aria-describedby={hint ? join(ariaDescribedBy, hintId) : ariaDescribedBy}
        className={join(
          "fynns-input",
          "fynns-search-input",
          size === "sm" && "fynns-input--sm",
          isInvalid && "fynns-input--invalid",
          className,
        )}
      />
      {trailing ? <span className="fynns-search-trailing">{trailing}</span> : null}
    </div>
  );

  if (!hint) return shell;

  return (
    <div className={join("fynns-field", isInvalid && "fynns-field--invalid")}>
      {shell}
      <p
        id={hintId}
        className={join("fynns-field-hint", !!errorText && "fynns-field-hint--error")}
      >
        {hint}
      </p>
    </div>
  );
});
