import type { HTMLAttributes, ReactNode } from "react";
import { Button } from "./Button";
import { CheckIcon } from "./icons";

export type StepperStep = {
  label: ReactNode;
  description?: ReactNode;
  /** Marks the step as optional in the UI (does not change navigation). */
  optional?: boolean;
};

export type StepperOrientation = "horizontal" | "vertical";

export type StepperProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  steps: StepperStep[];
  /** 0-based index of the active step. */
  activeIndex: number;
  /**
   * When set, completed steps (index < `activeIndex`) become clickable and
   * call this with the target index.
   */
  onStepChange?: (index: number) => void;
  /** @default "horizontal" */
  orientation?: StepperOrientation;
  disabled?: boolean;
  /** Accessible name for the nav landmark. @default "Progress" */
  ariaLabel?: string;
};

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/**
 * Linear step indicator (horizontal or vertical). Active step uses
 * `aria-current="step"`; completed steps before `activeIndex` are clickable
 * when `onStepChange` is provided.
 */
export function Stepper({
  steps,
  activeIndex,
  onStepChange,
  orientation = "horizontal",
  disabled = false,
  ariaLabel = "Progress",
  className,
  ...rest
}: StepperProps) {
  const rootClass = join(
    "fynns-stepper",
    `fynns-stepper--${orientation}`,
    disabled && "fynns-stepper--disabled",
    className,
  );

  return (
    <nav {...rest} className={rootClass} aria-label={ariaLabel}>
      <ol className="fynns-stepper-list">
        {steps.map((step, index) => {
          const completed = index < activeIndex;
          const active = index === activeIndex;
          const clickable =
            !disabled && completed && onStepChange != null;

          return (
            <li
              key={index}
              className={join(
                "fynns-stepper-item",
                completed && "fynns-stepper-item--completed",
                active && "fynns-stepper-item--active",
              )}
              aria-current={active ? "step" : undefined}
            >
              <div className="fynns-stepper-indicator" aria-hidden>
                <span className="fynns-stepper-circle">
                  {completed ? (
                    <CheckIcon size={16} className="fynns-stepper-check" />
                  ) : (
                    <span className="fynns-stepper-number">{index + 1}</span>
                  )}
                </span>
              </div>
              <div className="fynns-stepper-content">
                {clickable ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="fynns-stepper-label"
                    onClick={() => onStepChange(index)}
                  >
                    {step.label}
                  </Button>
                ) : (
                  <span className="fynns-stepper-label">{step.label}</span>
                )}
                {step.description != null ? (
                  <div className="fynns-stepper-description">
                    {step.description}
                  </div>
                ) : null}
                {step.optional ? (
                  <div className="fynns-stepper-optional">Optional</div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
