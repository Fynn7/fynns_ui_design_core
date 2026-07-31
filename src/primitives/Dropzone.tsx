import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { Button } from "./Button";
import { LinearProgress } from "./Progress";

export type DropzoneProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "onDrop" | "onDragOver" | "onDragLeave" | "onClick"
> & {
  /** Called with the selected / dropped file list. */
  onFiles: (files: File[]) => void;
  /** Native `accept` for the hidden file input (e.g. `"image/*"`). */
  accept?: string;
  /** Allow multiple files. @default false */
  multiple?: boolean;
  disabled?: boolean;
  /** Shows an indeterminate linear progress and blocks interaction. */
  busy?: boolean;
  /** Primary label above the browse control. @default "Drop files here" */
  label?: ReactNode;
  /** Supporting hint under the label. */
  hint?: ReactNode;
  /** Browse button label. @default "Browse" */
  browseLabel?: string;
};

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function filesFromList(list: FileList | null | undefined): File[] {
  if (list == null || list.length === 0) return [];
  return Array.from(list);
}

/**
 * File drop surface with a hidden `<input type="file">` and tonal browse
 * button. Drag-over adds `fynns-dropzone--active`; `busy` shows
 * `LinearProgress` and disables picking.
 */
export function Dropzone({
  onFiles,
  accept,
  multiple = false,
  disabled = false,
  busy = false,
  label = "Drop files here",
  hint,
  browseLabel = "Browse",
  className,
  ...rest
}: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState(false);
  const blocked = disabled || busy;

  const emit = (list: FileList | null | undefined) => {
    const files = filesFromList(list);
    if (files.length === 0) return;
    onFiles(files);
  };

  const openDialog = () => {
    if (blocked) return;
    inputRef.current?.click();
  };

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    emit(event.target.files);
    // Allow re-selecting the same file path.
    event.target.value = "";
  };

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (blocked) return;
    setActive(true);
  };

  const onDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setActive(false);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setActive(false);
    if (blocked) return;
    emit(event.dataTransfer.files);
  };

  const rootClass = join(
    "fynns-dropzone",
    active && "fynns-dropzone--active",
    blocked && "fynns-dropzone--disabled",
    busy && "fynns-dropzone--busy",
    className,
  );

  return (
    <div
      {...rest}
      className={rootClass}
      role="button"
      tabIndex={blocked ? -1 : 0}
      aria-disabled={blocked || undefined}
      aria-busy={busy || undefined}
      onClick={openDialog}
      onKeyDown={(event) => {
        if (blocked) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openDialog();
        }
      }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <input
        ref={inputRef}
        type="file"
        className="fynns-dropzone-input"
        accept={accept}
        multiple={multiple}
        disabled={blocked}
        tabIndex={-1}
        aria-hidden
        onChange={onInputChange}
        onClick={(event) => event.stopPropagation()}
      />
      <div className="fynns-dropzone-body">
        <div className="fynns-dropzone-label">{label}</div>
        {hint != null ? <div className="fynns-dropzone-hint">{hint}</div> : null}
        <Button
          type="button"
          variant="tonal"
          size="sm"
          className="fynns-dropzone-browse"
          disabled={blocked}
          onClick={(event) => {
            event.stopPropagation();
            openDialog();
          }}
        >
          {browseLabel}
        </Button>
      </div>
      {busy ? (
        <LinearProgress
          className="fynns-dropzone-progress"
          label="Uploading"
        />
      ) : null}
    </div>
  );
}
