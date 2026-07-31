import { useEffect, useState } from "react";
import {
  AlertCircleIcon,
  ArchiveIcon,
  ArrowLeftIcon,
  Avatar,
  Badge,
  Banner,
  BottomAppBar,
  BottomSheet,
  Breadcrumb,
  Button,
  Pagination,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  CodeBlock,
  Collapsible,
  ConfirmDialog,
  Checkbox,
  Chip,
  ChipSet,
  ChevronRightIcon,
  CircularProgress,
  Carousel,
  CarouselItem,
  Dialog,
  Divider,
  Drawer,
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  EmptyState,
  ErrorBanner,
  Fab,
  FolderOpenIcon,
  IconButton,
  InfoBanner,
  InfoHint,
  Input,
  Kbd,
  Counter,
  DatePicker,
  DatePickerDialog,
  TimePicker,
  TimePickerDialog,
  LinearProgress,
  List,
  ListItem,
  LayoutGridIcon,
  MenuIcon,
  NavigationBar,
  NavigationBarItem,
  NavigationDrawer,
  NavigationDrawerHeadline,
  NavigationDrawerItem,
  NavigationRail,
  NavigationRailHeader,
  NavigationRailItem,
  NavigationRailMenu,
  OtpInput,
  PanelCard,
  PlusIcon,
  Radio,
  SearchIcon,
  SearchBar,
  SearchBarResult,
  SearchInput,
  Select,
  SettingsIcon,
  Slider,
  Spinner,
  SplitButton,
  Stepper,
  SuccessBanner,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Tabs,
  Textarea,
  Toaster,
  ToggleControl,
  ToggleGroup,
  Tooltip,
  TopAppBar,
  TrashIcon,
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
  const [dateDialogOpen, setDateDialogOpen] = useState(false);
  const [galleryDate, setGalleryDate] = useState<string | null>("2026-07-15");
  const [timeDialogOpen, setTimeDialogOpen] = useState(false);
  const [galleryTime, setGalleryTime] = useState<string | null>("14:30");
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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [galleryPage, setGalleryPage] = useState(3);
  const [galleryOtp, setGalleryOtp] = useState("");
  const [galleryStep, setGalleryStep] = useState(1);
  const [galleryStyles, setGalleryStyles] = useState<Array<"bold" | "italic">>([
    "bold",
  ]);

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
          <Button variant="tonal">Tonal</Button>
          <Button variant="elevated">Elevated</Button>
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
            <DropdownMenuGroup label="File">
              <DropdownMenuItem>New</DropdownMenuItem>
              <DropdownMenuItem>Open</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
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
          <div style={{ width: "20rem", position: "relative", zIndex: 1 }}>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              ariaLabel="Search gallery"
              placeholder="Search…"
              expanded={searchExpanded}
              onExpandedChange={setSearchExpanded}
            >
              <SearchBarResult onClick={() => { setSearchQuery("Buttons"); setSearchExpanded(false); }}>
                Buttons
              </SearchBarResult>
              <SearchBarResult onClick={() => { setSearchQuery("Cards"); setSearchExpanded(false); }}>
                Cards
              </SearchBarResult>
            </SearchBar>
          </div>
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
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect fill='%230a3d3a' width='40' height='40'/%3E%3Ccircle cx='20' cy='15' r='7' fill='%232dd4bf'/%3E%3Cellipse cx='20' cy='38' rx='14' ry='13' fill='%232dd4bf'/%3E%3C/svg%3E"
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
        <Row>
          <Breadcrumb
            ariaLabel="Breadcrumb"
            items={[
              { label: "Home", onClick: () => {} },
              { label: "Library", onClick: () => {} },
              { label: "Radius", current: true },
            ]}
          />
        </Row>
        <Row>
          <Pagination page={galleryPage} pageCount={12} onPageChange={setGalleryPage} />
        </Row>
        <Row>
          <EmptyState
            icon={<FolderOpenIcon />}
            title="No items"
            description="Nothing to show yet."
            actions={<Button size="sm">Create</Button>}
            size="sm"
          />
          <OtpInput value={galleryOtp} onChange={setGalleryOtp} length={4} />
          <ToggleGroup
            multiple
            ariaLabel="Style"
            value={galleryStyles}
            onChange={setGalleryStyles}
            options={[
              { value: "bold", label: "Bold" },
              { value: "italic", label: "Italic" },
            ]}
          />
        </Row>
        <Row>
          <Stepper
            activeIndex={galleryStep}
            onStepChange={setGalleryStep}
            steps={[
              { label: "One" },
              { label: "Two" },
              { label: "Three" },
            ]}
          />
        </Row>
        <Row>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell align="end">Qty</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Accent</TableCell>
                <TableCell align="end">3</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Surface</TableCell>
                <TableCell align="end">8</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <CodeBlock
            label="sample.ts"
            code={`const accent = "var(--fynns-color-accent)";`}
            showCopy={false}
          />
        </Row>
        <div style={{ width: "100%", maxWidth: "24rem" }}>
          <TopAppBar
            title="Library"
            leading={
              <Tooltip content="Back">
                <IconButton aria-label="Back">
                  <ArrowLeftIcon />
                </IconButton>
              </Tooltip>
            }
            trailing={
              <Tooltip content="Search">
                <IconButton aria-label="Search">
                  <SearchIcon />
                </IconButton>
              </Tooltip>
            }
          />
        </div>
        <div style={{ width: "100%", maxWidth: "24rem" }}>
          <BottomAppBar
            aria-label="Bottom app bar"
            actions={
              <>
                <Tooltip content="Search">
                  <IconButton aria-label="Search">
                    <SearchIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip content="Archive">
                  <IconButton aria-label="Archive">
                    <ArchiveIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip content="Delete">
                  <IconButton aria-label="Delete">
                    <TrashIcon />
                  </IconButton>
                </Tooltip>
              </>
            }
            floatingActionButton={
              <Fab size="sm" aria-label="Create">
                <PlusIcon />
              </Fab>
            }
          />
        </div>
        <div
          style={{
            display: "inline-flex",
            border: "1px solid var(--fynns-color-border)",
            borderRadius: "var(--fynns-radius-md)",
            overflow: "hidden",
            height: "22rem",
            background: "var(--fynns-color-app-bg)",
          }}
        >
          <NavigationRail aria-label="Navigation rail">
            <NavigationRailMenu>
              <Tooltip content="Menu">
                <IconButton aria-label="Menu">
                  <MenuIcon size={24} />
                </IconButton>
              </Tooltip>
            </NavigationRailMenu>
            <NavigationRailHeader>
              <Fab size="sm" aria-label="Create">
                <PlusIcon />
              </Fab>
            </NavigationRailHeader>
            <NavigationRailItem icon={<FolderOpenIcon />} label="Home" active />
            <NavigationRailItem icon={<SearchIcon />} label="Search" badge={2} />
            <NavigationRailItem icon={<SettingsIcon />} label="Settings" badge />
            <NavigationRailItem icon={<LayoutGridIcon />} label="All" />
          </NavigationRail>
        </div>
        <div
          style={{
            width: "100%",
            maxWidth: "28rem",
            border: "1px solid var(--fynns-color-border)",
            borderRadius: "var(--fynns-radius-md)",
            overflow: "hidden",
            background: "var(--fynns-color-app-bg)",
          }}
        >
          <NavigationBar aria-label="Navigation bar">
            <NavigationBarItem icon={<FolderOpenIcon />} label="Home" active />
            <NavigationBarItem icon={<SearchIcon />} label="Search" badge={2} />
            <NavigationBarItem icon={<SettingsIcon />} label="Settings" badge />
            <NavigationBarItem icon={<LayoutGridIcon />} label="All" />
          </NavigationBar>
        </div>
        <div
          style={{
            height: "16rem",
            border: "1px solid var(--fynns-color-border)",
            borderRadius: "var(--fynns-radius-md)",
            overflow: "hidden",
            background: "var(--fynns-color-app-bg)",
          }}
        >
          <NavigationDrawer
            variant="standard"
            aria-label="Navigation drawer"
            headline="Mail"
          >
            <NavigationDrawerItem icon={<FolderOpenIcon />} label="Inbox" active badge={24} />
            <NavigationDrawerItem icon={<SearchIcon />} label="Sent" />
            <NavigationDrawerHeadline>Labels</NavigationDrawerHeadline>
            <NavigationDrawerItem icon={<SettingsIcon />} label="Settings" badge />
          </NavigationDrawer>
        </div>
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
          <span style={{ color: "var(--fynns-color-text-muted)", fontSize: "var(--fynns-font-size-caption)" }}>
            List / ListItem
          </span>
          <div
            style={{
              width: "100%",
              maxWidth: "22rem",
              border: "1px solid var(--fynns-color-border)",
              borderRadius: "var(--fynns-radius-md)",
              overflow: "hidden",
              background: "var(--fynns-color-surface-1)",
            }}
          >
            <List aria-label="Gallery content list">
              <ListItem
                headline="Inbox"
                leading={<FolderOpenIcon />}
                trailing={<ChevronRightIcon />}
                trailingSupportingText="24"
                selected
                onClick={() => {}}
              />
              <Divider inset />
              <ListItem
                headline="Ada Lovelace"
                supportingText="Notes from yesterday’s review"
                leading={<Avatar name="Ada Lovelace" alt="Ada Lovelace" />}
                trailingSupportingText="10:24"
                onClick={() => {}}
              />
              <Divider inset />
              <ListItem
                overline="Label"
                headline="Design system sync"
                supportingText="Token ladder and chrome strips share the radius band."
                leading={<SearchIcon />}
                trailing={<ChevronRightIcon />}
                onClick={() => {}}
              />
            </List>
          </div>
          <span style={{ color: "var(--fynns-color-text-muted)", fontSize: "var(--fynns-font-size-caption)" }}>
            Carousel
          </span>
          <div style={{ width: "100%", maxWidth: "28rem" }}>
            <Carousel ariaLabel="Gallery carousel" variant="multi">
              <CarouselItem label="One">
                <strong>One</strong>
                <span style={{ color: "var(--fynns-color-text-muted)" }}>Multi-browse peek</span>
              </CarouselItem>
              <CarouselItem label="Two">
                <strong>Two</strong>
                <span style={{ color: "var(--fynns-color-text-muted)" }}>Snap + arrows</span>
              </CarouselItem>
              <CarouselItem label="Three">
                <strong>Three</strong>
                <span style={{ color: "var(--fynns-color-text-muted)" }}>Indicator dots</span>
              </CarouselItem>
            </Carousel>
          </div>
          <span style={{ color: "var(--fynns-color-text-muted)", fontSize: "var(--fynns-font-size-caption)" }}>
            DatePicker
          </span>
          <DatePicker defaultValue="2026-07-15" weekStartsOn={1} />
          <Button size="sm" variant="tonal" onClick={() => setDateDialogOpen(true)}>
            Open date dialog
          </Button>
          <DatePickerDialog
            open={dateDialogOpen}
            onOpenChange={setDateDialogOpen}
            value={galleryDate}
            onConfirm={setGalleryDate}
            title="Select date"
            weekStartsOn={1}
          />
          <span style={{ color: "var(--fynns-color-text-muted)", fontSize: "var(--fynns-font-size-caption)" }}>
            TimePicker
          </span>
          <TimePicker value={galleryTime} onChange={setGalleryTime} hourCycle="h23" />
          <TimePicker value={galleryTime} onChange={setGalleryTime} hourCycle="h12" />
          <Button size="sm" variant="tonal" onClick={() => setTimeDialogOpen(true)}>
            Open time dialog
          </Button>
          <TimePickerDialog
            open={timeDialogOpen}
            onOpenChange={setTimeDialogOpen}
            value={galleryTime}
            onConfirm={setGalleryTime}
            title="Select time"
            hourCycle="h12"
          />
        </div>
      </Section>

      <Section title="Alerts">
        <Row>
          <InfoBanner message="Informational banner." />
          <SuccessBanner message="Operation succeeded." />
          <WarningBanner message="Careful with this." />
          <ErrorBanner message="An error occurred." />
        </Row>
        <div style={{ width: "100%", maxWidth: "28rem" }}>
          <Banner
            variant="tonal"
            text="A new version is available"
            supportingText="Restart to apply updates when you are ready."
            actions={<Button size="sm" variant="ghost">Learn more</Button>}
            onDismiss={() => undefined}
            dismissAriaLabel="Dismiss banner"
          />
        </div>
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
