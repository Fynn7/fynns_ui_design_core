/**
 * Checkbox/radio styled as a switch with a leading control and trailing label.
 * Use `Switch` for the button-style toggle; use this when you need a real
 * `<input type="checkbox|radio">` (e.g. inside a `<form>` or radio group).
 */
export type ToggleControlProps = {
  label: string;
  checked: boolean;
  onChange: (nextChecked: boolean) => void;
  name?: string;
  type?: "checkbox" | "radio";
  disabled?: boolean;
};

export function ToggleControl({
  label,
  checked,
  onChange,
  name,
  type = "checkbox",
  disabled = false,
}: ToggleControlProps) {
  return (
    <label className="fynns-toggle fynns-toggle--switch">
      <input
        type={type}
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="fynns-toggle-track" aria-hidden="true">
        <span className="fynns-toggle-track__thumb" />
      </span>
      <span className="fynns-toggle-label">{label}</span>
    </label>
  );
}
