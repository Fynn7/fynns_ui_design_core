import { useEffect, useState } from "react";
import {
  AlertCircleIcon,
  Avatar,
  Badge,
  BottomSheet,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Collapsible,
  ConfirmDialog,
  Checkbox,
  Chip,
  ChipSet,
  CircularProgress,
  Dialog,
  Divider,
  Drawer,
  DropdownMenu,
  DropdownMenuItem,
  ErrorBanner,
  Fab,
  IconButton,
  InfoBanner,
  InfoHint,
  Input,
  Kbd,
  Counter,
  LinearProgress,
  PanelCard,
  PlusIcon,
  Radio,
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
  const [sheetOpen, setSheetOpen] = useState(false);
  const [checked, setChecked] = useState(true);
  const [toggleChecked, setToggleChecked] = useState(false);
  const [checkboxOn, setCheckboxOn] = useState(true);
  const [radioValue, setRadioValue] = useState<"a" | "b">("a");
  const [filterChip, setFilterChip] = useState(true);
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

      <Section title="Cards (M3 variants)">
        <Row>
          {(["elevated", "filled", "outlined"] as const).map((variant) => (
            <Card key={variant} variant={variant} style={{ width: "16rem" }}>
              <CardHeader title={variant} subtitle="Subject card" avatar="C" />
              <CardContent>
                Shared anatomy: header, content, actions. PanelCard remains the layout shell.
              </CardContent>
              <CardActions align="end">
                <Button size="sm" variant="ghost">
                  Cancel
                </Button>
                <Button size="sm" variant="primary">
                  Open
                </Button>
              </CardActions>
            </Card>
          ))}
          <Card variant="elevated" interactive style={{ width: "16rem" }} onClick={() => toast.success("Card clicked")}>
            <CardHeader title="Interactive" subtitle="Hover / press / focus" />
            <CardContent>Uses state-layer tokens for feedback.</CardContent>
          </Card>
          <Card variant="filled" style={{ width: "16rem" }}>
            <CardActionArea onClick={() => toast.message("Action area")}>
              <CardMedia>
                <div className="fynns-card-media-placeholder" aria-hidden>
                  Media
                </div>
              </CardMedia>
              <CardHeader title="Media + ActionArea" subtitle="Custom media children" />
              <CardContent>Primary surface is clickable; actions stay outside.</CardContent>
            </CardActionArea>
            <CardActions>
              <Button size="sm" variant="ghost">
                Share
              </Button>
              <Button size="sm" variant="primary">
                Learn more
              </Button>
            </CardActions>
          </Card>
          <Card variant="outlined" style={{ width: "16rem" }}>
            <CardHeader title="Dense actions" subtitle="disableSpacing" />
            <CardContent>Actions row without default padding/gap.</CardContent>
            <CardActions disableSpacing align="end">
              <Button size="sm" variant="ghost">
                A
              </Button>
              <Button size="sm" variant="primary">
                B
              </Button>
            </CardActions>
          </Card>
        </Row>
      </Section>

      <Section title="Collapsible">
        <Row>
          <div style={{ width: "20rem" }}>
            <Collapsible title="Presets" defaultOpen>
              One-shot disclosure: pass title and children. Chevron, head, and body
              chrome are built in.
            </Collapsible>
          </div>
        </Row>
      </Section>

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
          <Checkbox label="Checkbox" checked={checkboxOn} onCheckedChange={setCheckboxOn} />
          <Checkbox label="Indeterminate" checked={false} indeterminate onCheckedChange={setCheckboxOn} />
          <Radio
            name="gallery-radio"
            value="a"
            label="Radio A"
            checked={radioValue === "a"}
            onCheckedChange={() => setRadioValue("a")}
          />
          <Radio
            name="gallery-radio"
            value="b"
            label="Radio B"
            checked={radioValue === "b"}
            onCheckedChange={() => setRadioValue("b")}
          />
          <ChipSet ariaLabel="Chips">
            <Chip onClick={() => {}}>Assist</Chip>
            <Chip
              variant="filter"
              selected={filterChip}
              onClick={() => setFilterChip((v) => !v)}
            >
              Filter
            </Chip>
            <Chip variant="input" selected onRemove={() => {}}>
              Input
            </Chip>
          </ChipSet>
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
          <Button onClick={() => setSheetOpen(true)}>Open bottom sheet</Button>
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
          <CircularProgress value={0.7} label="70 percent" size="sm" />
          <CircularProgress label="Working" />
          <Avatar size="sm" name="Ada" alt="Ada" />
          <Avatar name="Ada Lovelace" alt="Ada Lovelace" />
          <Avatar alt="User" />
          <Avatar
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect fill='%232dd4bf' width='40' height='40'/%3E%3C/svg%3E"
            name="Ada Lovelace"
            alt="Ada image"
          />
          <Avatar src="/__missing-avatar__.png" name="Broken Src" alt="Broken image fallback" />
          <Tooltip content="Create">
            <Fab aria-label="Create">
              <PlusIcon />
            </Fab>
          </Tooltip>
          <Fab label="Create item">
            <PlusIcon />
          </Fab>
        </Row>
        <div style={{ width: "100%", maxWidth: "20rem", display: "grid", gap: "var(--fynns-space-sm)" }}>
          <span style={{ color: "var(--fynns-color-text-muted)", fontSize: "var(--fynns-font-size-caption)" }}>
            Linear progress
          </span>
          <LinearProgress value={0.42} label="42 percent" />
          <LinearProgress label="Loading" />
          <span style={{ color: "var(--fynns-color-text-muted)", fontSize: "var(--fynns-font-size-caption)" }}>
            Divider
          </span>
          <Divider />
          <Divider inset />
          <div
            style={{
              display: "flex",
              alignItems: "stretch",
              gap: "var(--fynns-space-md)",
              height: "2.5rem",
            }}
          >
            <span style={{ color: "var(--fynns-color-text-muted)", fontSize: "var(--fynns-font-size-caption)" }}>
              A
            </span>
            <Divider orientation="vertical" />
            <span style={{ color: "var(--fynns-color-text-muted)", fontSize: "var(--fynns-font-size-caption)" }}>
              B
            </span>
          </div>
        </div>
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

      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Bottom sheet"
        description="Slides up from the bottom edge."
        actions={
          <Button onClick={() => setSheetOpen(false)}>
            Done
          </Button>
        }
      >
        <p style={{ marginTop: 0 }}>
          Prefer BottomSheet for mobile-leaning actions; use Drawer for desktop side panels.
        </p>
      </BottomSheet>

      <Toaster />
    </div>
  );
}
