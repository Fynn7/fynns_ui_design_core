import { useEffect, useState } from "react";
import {
  AlertCircleIcon,
  Badge,
  Button,
  ConfirmDialog,
  Dialog,
  Drawer,
  DropdownMenu,
  DropdownMenuItem,
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
  applyFynnsThemeMode,
  getFynnsThemeMode,
  restoreFynnsThemeMode,
  toast,
  type FynnsThemeMode,
} from "@fynns/ui";
import { Foundations } from "./Foundations";
import { Motion } from "./Motion";
import { Row, Section } from "./galleryShared";

export function App() {
  const [theme, setTheme] = useState<FynnsThemeMode>("dark");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [checked, setChecked] = useState(true);
  const [toggleChecked, setToggleChecked] = useState(false);
  const [seg, setSeg] = useState<"a" | "b" | "c">("a");
  const [tab, setTab] = useState<"one" | "two">("one");
  const [fruit, setFruit] = useState("Apple");
  const [count, setCount] = useState(5);
  const [speed, setSpeed] = useState(40);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setTheme(restoreFynnsThemeMode());
  }, []);

  const toggleTheme = () => {
    const next: FynnsThemeMode = getFynnsThemeMode() === "light" ? "dark" : "light";
    applyFynnsThemeMode(next);
    setTheme(next);
  };

  return (
    <div
      style={{
        minHeight: "100%",
        padding: "var(--fynns-space-lg)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--fynns-space-lg)",
        maxWidth: "60rem",
        margin: "0 auto",
      }}
    >
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--fynns-space-sm)" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "var(--fynns-space-sm)" }}>
          <h1 style={{ margin: 0, color: "var(--fynns-color-accent)", fontSize: "var(--fynns-font-size-lg)" }}>
            fynns UI design core
          </h1>
          <span style={{ color: "var(--fynns-color-text-muted)", fontSize: "var(--fynns-font-size-form-label)" }}>
            design gallery v0.2
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={toggleTheme}>
          {theme === "light" ? "Dark" : "Light"} theme
        </Button>
      </header>

      <Foundations />
      <Motion />

      <Section title="Buttons (state matrix)">
        <Row>
          <Button>Default</Button>
          <Button variant="primary">Primary</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="ghost">Ghost</Button>
          <Button active>Active</Button>
          <Button size="sm">Small</Button>
          <Button disabled>Disabled</Button>
          <Button variant="primary" disabled>
            Primary off
          </Button>
          <IconButton aria-label="Info">
            <AlertCircleIcon size={16} />
          </IconButton>
          <SplitButton
            menuOpen={menuOpen}
            onMenuOpenChange={setMenuOpen}
            onMainClick={() => toast.success("Main action")}
            menu={
              <>
                <DropdownMenuItem>Option A</DropdownMenuItem>
                <DropdownMenuItem>Option B</DropdownMenuItem>
              </>
            }
          >
            Generate
          </SplitButton>
          <DropdownMenu trigger="Menu" ariaLabel="Actions">
            <DropdownMenuItem>Rename</DropdownMenuItem>
            <DropdownMenuItem>Delete</DropdownMenuItem>
          </DropdownMenu>
        </Row>
      </Section>

      <Section title="Inputs">
        <Row>
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
        </Row>
      </Section>

      <Section title="Toggles">
        <Row>
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
        </Row>
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
        <Row>
          <Button onClick={() => setDialogOpen(true)}>Open dialog</Button>
          <Button onClick={() => setConfirmOpen(true)}>Confirm dialog</Button>
          <Button onClick={() => setDrawerOpen(true)}>Open drawer</Button>
          <Tooltip content="A self-positioned tooltip">
            <Button>Hover me</Button>
          </Tooltip>
          <InfoHint content="Inline help text shown on hover or focus." />
          <Button onClick={() => toast.error("Something failed")}>Toast error</Button>
          <Button onClick={() => toast.message("Heads up", { description: "With a description." })}>
            Toast message
          </Button>
          <Button
            onClick={() => {
              toast.success("First toast");
              toast.info("Second toast", { description: "Stacked with enter animation." });
            }}
          >
            Toast stack
          </Button>
        </Row>
      </Section>

      <Section title="Feedback">
        <Row>
          <Badge variant="success">success</Badge>
          <Badge variant="danger">danger</Badge>
          <Badge variant="warning">warning</Badge>
          <Badge variant="info">info</Badge>
          <Badge variant="accent">accent</Badge>
          <Kbd>Ctrl</Kbd>
          <Kbd>K</Kbd>
          <Spinner label="Loading" />
        </Row>
      </Section>

      <Section title="Alerts">
        <Row>
          <InfoBanner message="Informational banner." />
          <SuccessBanner message="Operation succeeded." />
          <WarningBanner message="Careful with this." />
          <ErrorBanner message="An error occurred." />
        </Row>
      </Section>

      <PanelCard title="Panel card" fill={false}>
        <div style={{ padding: "var(--fynns-space-sm)" }}>Panel body on surface-1 elevation.</div>
      </PanelCard>

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Example dialog"
        description="Centered modal with scrim fade + panel scale/translate enter animation."
      >
        <p style={{ marginTop: 0 }}>Dialog body.</p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--fynns-space-sm)" }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => setDialogOpen(false)}>
            Confirm
          </Button>
        </div>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete project?"
        description="This action cannot be undone."
        danger
        onConfirm={() => setConfirmOpen(false)}
      />

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Side drawer">
        <p style={{ marginTop: 0 }}>Drawer slides in from the right with the shared frame presence lifecycle.</p>
      </Drawer>

      <Toaster />
    </div>
  );
}
