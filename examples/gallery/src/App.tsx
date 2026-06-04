import type { ReactNode } from "react";
import { useState } from "react";
import {
  AlertCircleIcon,
  Badge,
  Button,
  Dialog,
  ErrorBanner,
  IconButton,
  InfoBanner,
  InfoHint,
  Input,
  Kbd,
  Counter,
  PanelCard,
  SearchInput,
  Select,
  Slider,
  Spinner,
  SplitButton,
  SuccessBanner,
  Switch,
  Tabs,
  Textarea,
  Toaster,
  ToggleControl,
  ToggleGroup,
  Tooltip,
  WarningBanner,
  toast,
} from "@fynns/ui";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <h2
        style={{
          margin: 0,
          fontSize: "0.8rem",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          color: "var(--fynns-color-text-muted)",
        }}
      >
        {title}
      </h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
        {children}
      </div>
    </section>
  );
}

export function App() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [checked, setChecked] = useState(true);
  const [toggleChecked, setToggleChecked] = useState(false);
  const [seg, setSeg] = useState<"a" | "b" | "c">("a");
  const [tab, setTab] = useState<"one" | "two">("one");
  const [fruit, setFruit] = useState("Apple");
  const [count, setCount] = useState(5);
  const [speed, setSpeed] = useState(40);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      style={{
        minHeight: "100%",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        maxWidth: "60rem",
        margin: "0 auto",
      }}
    >
      <header style={{ display: "flex", alignItems: "baseline", gap: "0.75rem" }}>
        <h1 style={{ margin: 0, color: "var(--fynns-color-accent)", fontSize: "1.25rem" }}>
          fynns UI design core
        </h1>
        <span style={{ color: "var(--fynns-color-text-muted)", fontSize: "0.85rem" }}>
          kitchen-sink gallery
        </span>
      </header>

      <Section title="Buttons">
        <Button>Default</Button>
        <Button variant="primary">Primary</Button>
        <Button variant="danger">Danger</Button>
        <Button variant="ghost">Ghost</Button>
        <Button active>Active</Button>
        <Button size="sm">Small</Button>
        <Button disabled>Disabled</Button>
        <IconButton aria-label="Info">
          <AlertCircleIcon size={16} />
        </IconButton>
        <SplitButton
          menuOpen={menuOpen}
          onMenuOpenChange={setMenuOpen}
          onMainClick={() => toast.success("Main action")}
          menu={<div style={{ padding: "0.5rem" }}>Menu content</div>}
        >
          Generate
        </SplitButton>
      </Section>

      <Section title="Inputs">
        <Input placeholder="Text input" defaultValue="" />
        <Textarea placeholder="Textarea" style={{ minHeight: "3rem", width: "16rem" }} />
        <Counter value={count} onChange={setCount} min={1} max={20} ariaLabel="Count" />
        <SearchInput placeholder="Search..." wrapClassName="" style={{ width: "16rem" }} />
        <Select
          value={fruit}
          onChange={setFruit}
          options={["Apple", "Banana", "Cherry"]}
          ariaLabel="Fruit"
        />
        <div style={{ width: "16rem" }}>
          <Slider value={speed} onChange={setSpeed} ariaLabel="Speed" />
        </div>
      </Section>

      <Section title="Toggles">
        <Switch label="Switch (md)" checked={checked} onCheckedChange={setChecked} />
        <Switch label="Switch (sm)" size="sm" checked={checked} onCheckedChange={setChecked} />
        <ToggleControl label="Toggle control" checked={toggleChecked} onChange={setToggleChecked} />
        <ToggleGroup
          value={seg}
          onChange={setSeg}
          options={[
            { value: "a", label: "A" },
            { value: "b", label: "B" },
            { value: "c", label: "C" },
          ]}
        />
      </Section>

      <Section title="Tabs">
        <Tabs
          activeId={tab}
          onChange={setTab}
          tabs={[
            { id: "one", label: "One" },
            { id: "two", label: "Two" },
          ]}
        />
      </Section>

      <Section title="Overlays">
        <Button onClick={() => setDialogOpen(true)}>Open dialog</Button>
        <Tooltip content="A self-positioned tooltip">
          <Button>Hover me</Button>
        </Tooltip>
        <InfoHint content="Inline help text shown on hover or focus." />
        <Button onClick={() => toast.error("Something failed")}>Toast error</Button>
        <Button onClick={() => toast.message("Heads up", { description: "With a description." })}>
          Toast message
        </Button>
      </Section>

      <Section title="Feedback">
        <Badge variant="success">success</Badge>
        <Badge variant="danger">danger</Badge>
        <Badge variant="info">info</Badge>
        <Badge variant="accent">accent</Badge>
        <Kbd>Ctrl</Kbd>
        <Kbd>K</Kbd>
        <Spinner label="Loading" />
      </Section>

      <Section title="Alerts">
        <InfoBanner message="Informational banner." />
        <SuccessBanner message="Operation succeeded." />
        <WarningBanner message="Careful with this." />
        <ErrorBanner message="An error occurred." />
      </Section>

      <PanelCard title="Panel card" fill={false}>
        <div style={{ padding: "0.75rem" }}>Panel body content.</div>
      </PanelCard>

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Example dialog"
        description="Self-developed modal: portal, focus trap, Esc and scrim dismiss."
      >
        <p style={{ marginTop: 0 }}>Dialog body.</p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => setDialogOpen(false)}>
            Confirm
          </Button>
        </div>
      </Dialog>

      <Toaster />
    </div>
  );
}
