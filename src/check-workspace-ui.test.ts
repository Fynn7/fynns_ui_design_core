import { describe, expect, it } from "vitest";
// @ts-expect-error Node CLI module has no declaration file.
import { checkWorkspaceSource } from "../scripts/check-workspace-ui.mjs";

const imports = 'import { Button, IconButton, Toolbar, TopAppBar, PanelRightIcon, HomeIcon, ArrowLeftIcon, InlineAlert, CloseIcon, CodeBlock } from "@fynns/ui";';
const rules = (source: string) => checkWorkspaceSource(imports + source).map((v: { rule: string }) => v.rule);

describe("workspace consumer contract", () => {
  it("rejects a second canvas toolbar, including aliases and same-file helpers", () => {
    expect(rules('function Extra(){return <Toolbar/>;} const sample = <div className="fynns-workspace-canvas"><Toolbar variant="floating"/><Extra/></div>;')).toContain("canvas-single-toolbar");
    expect(checkWorkspaceSource('import { Toolbar as Tools } from "@fynns/ui"; const sample = <div className="fynns-workspace-canvas"><Tools/><Tools/></div>;').map((v: {rule: string}) => v.rule)).toContain("canvas-single-toolbar");
    expect(rules('const sample = <div className="fynns-workspace-canvas">{compact ? <Toolbar/> : <Toolbar/>}</div>;')).toEqual([]);
    expect(rules('const sample = <div className="fynns-workspace-canvas"><Toolbar><Button onClick={() => {const unused = <Toolbar/>;}}>Create</Button></Toolbar></div>;')).toEqual([]);
  });
  it("rejects document toolbars above the pane row while preserving inspector actions and separate page specimens", () => {
    expect(rules('const sample = <div className="fynns-workspace-panes"><Toolbar aria-label="Document commands"/><div className="fynns-workspace-canvas"><Toolbar variant="floating"/></div><EndAside open/></div>;')).toContain("workspace-command-menu");
    expect(rules('const sample = <ClippedNavShell><Toolbar/><div className="fynns-workspace-panes"><div className="fynns-workspace-canvas"><Toolbar variant="floating"/></div><EndAside open/></div></ClippedNavShell>;')).toContain("workspace-command-menu");
    expect(rules('const sample = <><div className="fynns-workspace-panes"><div className="fynns-workspace-canvas"><Toolbar variant="floating"/></div><EndAside open><Toolbar/></EndAside></div><div className="fynns-docked-tools-inset"><Toolbar variant="docked"/></div></>;')).toEqual([]);
  });
  it("rejects docked canvas tools by semantic label or shared overlay host", () => {
    expect(rules('const sample = <Toolbar variant="docked" aria-label="画布工具栏"><Button variant="ghost">Arrange</Button></Toolbar>;')).toContain("canvas-tools-floating");
    expect(rules('const sample = <div className="fynns-workspace-tools"><Toolbar variant="docked" aria-label={labels.tools}><Button variant="ghost">Arrange</Button></Toolbar></div>;')).toContain("canvas-tools-floating");
    expect(rules('const sample = <><div className="fynns-workspace-tools"><Toolbar variant="floating" aria-label="Canvas tools"><Button variant="ghost">Arrange</Button></Toolbar></div><div className="fynns-docked-tools-inset"><Toolbar variant="docked" aria-label="Page tools"><Button variant="ghost">Arrange</Button></Toolbar></div></>;')).toEqual([]);
  });
  it("rejects competing default and explicit primary buttons through wrappers/helpers", () => {
    expect(rules('const extra = <Button>Duplicate</Button>; const sample = <Toolbar><span><Button variant="primary">Front</Button></span>{extra}</Toolbar>;')).toContain("action-emphasis");
    expect(rules('function Actions(){return <><Button>Front</Button><Button>Back</Button></>;} const sample = <div className="fynns-control-cluster"><Actions/></div>;')).toContain("action-emphasis");
  });
  it("accepts one primary plus ghost/tonal actions and independent groups", () => {
    expect(rules('const sample = <><Toolbar><Button variant="ghost">Cancel</Button><Button variant="primary">Save</Button></Toolbar><Toolbar><Button variant="tonal">Copy</Button><Button>Apply</Button></Toolbar></>;')).toEqual([]);
  });
  it("resolves local literal variants and icon nodes without inventing emphasis for dynamic variants", () => {
    expect(rules('const variant = "ghost"; const icon = <HomeIcon/>; const sample = <><Toolbar><Button variant={variant}>Copy</Button><Button>Apply</Button></Toolbar><IconButton aria-label="Home">{icon}</IconButton></>;')).toEqual([]);
    expect(rules('const sample = <Toolbar><Button variant={props.variant}>Copy</Button><Button>Apply</Button></Toolbar>;')).toEqual([]);
    expect(rules('const sample = <Button>{labels.cancel}</Button>;')).toContain("cancel-ghost");
  });
  it("does not count controls created inside event handlers as rendered siblings", () => {
    expect(rules('const sample = <Toolbar><Button onClick={() => {const temporary = <Button/>;}}>Save</Button></Toolbar>;')).toEqual([]);
  });
  it("recognizes aliased and namespace imports", () => {
    expect(checkWorkspaceSource('import { Button as Action, PanelRightIcon as Panel } from "@fynns/ui"; const sample = <Action><Panel/>Sidebar</Action>;').map((v: { rule: string }) => v.rule)).toContain("chrome-icon");
    expect(checkWorkspaceSource('import * as UI from "@fynns/ui"; const sample = <UI.IconButton variant="primary"><UI.HomeIcon/></UI.IconButton>;').map((v: { rule: string }) => v.rule)).toContain("chrome-icon");
  });
  it("rejects filled/labeled panel and home chrome plus labeled top-bar back", () => {
    expect(rules('const sample = <><Button><PanelRightIcon/>Sidebar</Button><IconButton variant="primary"><HomeIcon/></IconButton><TopAppBar leading={<Button><ArrowLeftIcon/>Projects</Button>}/></>;').filter((v: string) => v === "chrome-icon")).toHaveLength(3);
  });
  it("rejects cancel primary, embedded alert controls and full-width overrides", () => {
    expect(rules('const sample = <><Button><CloseIcon/>取消</Button><InlineAlert severity="error" style={{width:"100%"}}><Button>Dismiss</Button></InlineAlert></>;')).toEqual(expect.arrayContaining(["cancel-ghost", "inline-dismiss", "inline-geometry"]));
    expect(rules('const sample = <InlineAlert severity="error" message={<IconButton><CloseIcon/></IconButton>}/>;')).toContain("inline-dismiss");
    expect(rules('const sample = <InlineAlert severity="error" message="Try again" onDismiss={() => {}} dismissAriaLabel="Dismiss"/>;')).toEqual([]);
  });
  it("rejects all-cap chrome but preserves code and natural-case labels", () => {
    expect(rules('const sample = <><h2>LOCAL WORKSPACE</h2><span>SOURCE</span><Button title="NEW DOCUMENT">New document</Button><CodeBlock code="HTTP JSON"/><code>HTTP JSON</code></>;').filter((v: string) => v === "natural-case")).toHaveLength(3);
  });
  it("rejects a hand-rolled topbar+drawer shell outside ClippedNavShell", () => {
    const shellImports = 'import { ClippedNavShell, DestinationAppShell, TopAppBar, NavigationDrawer, NavigationRail } from "@fynns/ui";';
    const bad = (body: string) => checkWorkspaceSource(`${shellImports} const sample = ${body};`).map((v: { rule: string }) => v.rule);
    expect(bad('<div><TopAppBar title="A"/><NavigationDrawer variant="standard"/></div>')).toContain("app-shell-slots");
    expect(bad('<><TopAppBar title="A"/><NavigationRail/></>')).toContain("app-shell-slots");
    expect(bad('<ClippedNavShell topBar={<TopAppBar title="A"/>} nav={<NavigationDrawer variant="standard"/>}><div/></ClippedNavShell>')).not.toContain("app-shell-slots");
    expect(bad('<DestinationAppShell><TopAppBar title="A"/><NavigationDrawer variant="standard"/></DestinationAppShell>')).not.toContain("app-shell-slots");
    expect(bad('<div><TopAppBar title="A"/></div>')).not.toContain("app-shell-slots");
    expect(bad('<div><NavigationDrawer variant="standard"/></div>')).not.toContain("app-shell-slots");
    expect(bad('<div><TopAppBar title="A"/><NavigationDrawer variant="modal" open onClose={() => {}}/></div>')).not.toContain("app-shell-slots");
  });
});
