/**
 * @fynns/ui-design-core -- barrel entry.
 *
 * Importing this module also loads the design tokens + component styles, so
 * consumers only need `import { Button } from "@fynns/ui";`.
 */
import "./theme/theme.css";
import "./primitives/primitives.css";

/* Theme (tokens + helpers) */
export * from "./theme/tokens";
export * from "./theme/motionTokens";
export * from "./theme/scrollbar";
export * from "./theme/themeMode";

/* Icons (inline, dependency-free) */
export * from "./primitives/icons";

/* Primitives */
export * from "./primitives/Button";
export * from "./primitives/IconButton";
export * from "./primitives/SplitButton";
export * from "./primitives/Input";
export * from "./primitives/Textarea";
export * from "./primitives/Counter";
export * from "./primitives/SearchInput";
export * from "./primitives/Select";
export * from "./primitives/Combobox";
export * from "./primitives/DropdownMenu";
export * from "./primitives/Popover";
export * from "./primitives/Tooltip";
export * from "./primitives/InfoHint";
export * from "./primitives/Dialog";
export * from "./primitives/Drawer";
export * from "./primitives/Switch";
export * from "./primitives/ToggleControl";
export * from "./primitives/ToggleGroup";
export * from "./primitives/Tabs";
export * from "./primitives/Collapsible";
export * from "./primitives/ListGroup";
export * from "./primitives/ShellNav";
export * from "./primitives/Slider";
export * from "./primitives/Panel";
export * from "./primitives/Card";
export * from "./primitives/PanelCard";
export * from "./primitives/ScrollArea";
export * from "./primitives/Toast";
export * from "./primitives/Alert";
export * from "./primitives/Loading";
export * from "./primitives/Badge";
export * from "./primitives/Kbd";
export * from "./primitives/CommandPalette";
export * from "./primitives/captions";
