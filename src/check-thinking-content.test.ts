import { describe, expect, it } from "vitest";
// @ts-expect-error Node CLI module has no declaration file.
import { checkThinkingSource } from "../scripts/check-thinking-content.mjs";
describe("quiet thinking composition gate", () => {
  it("rejects direct and aliased cards, controls and activity trees", () => {
    expect(checkThinkingSource('import { Collapsible as Box } from "@fynns/ui"; const sample = <ChatThinking><Box/><Button/><ChatActivity/></ChatThinking>;').sort()).toEqual(["Button", "ChatActivity", "Collapsible"]);
  });
  it("rejects the indirect attempt-button and stage-card regression", () => {
    expect(checkThinkingSource('const selector = <Button>Attempt</Button>; function StageRow(){ return <Collapsible/>; } const sample = <ChatThinking>{selector}{rows.map(row => <StageRow key={row.id}/>)}</ChatThinking>;').sort()).toEqual(["Button", "Collapsible"]);
  });
  it("accepts muted text and nested thinking with controls outside", () => {
    expect(checkThinkingSource('const sample = <><ChatThinking><p>Retained text</p><ChatThinking label="Details">Small text</ChatThinking></ChatThinking><Button>Retry</Button></>;')).toEqual([]);
  });
  it("checks the children prop too", () => {
    expect(checkThinkingSource('const sample = <ChatThinking children={<button>Attempt</button>}/>;')).toEqual(["button"]);
  });
});

it("rejects controls smuggled into structured details or icon slots", () => {
  expect(checkThinkingSource('const details = [{ id: "step", label: "Review", icon: <Button/> }]; const sample = <ChatThinking details={details} icon={<Card/>}/>;').sort()).toEqual(["Button", "Card"]);
});
