import { afterEach, describe, expect, it } from "vitest";
import { captureTextSelection, selectionIsCurrent } from "./textSelection";

afterEach(() => { document.body.innerHTML = ""; document.getSelection()?.removeAllRanges(); });

function area(html: string) {
  const root = document.createElement("div");
  root.className = "fynns-text-selection-composer";
  root.innerHTML = html;
  document.body.append(root);
  return root;
}

describe("text reference selection capture", () => {
  it("captures exact UTF-16 offsets and keeps a snapshot when input focus moves", () => {
    const root = area("<textarea></textarea>");
    const control = root.querySelector("textarea")!;
    control.value = "A 😀 phrase B";
    control.focus();
    control.setSelectionRange(2, 11);
    const selected = captureTextSelection(root)!;
    expect(selected).toMatchObject({ text: "😀 phrase", start: 2, end: 11 });
    control.blur();
    expect(selectionIsCurrent(selected)).toBe(true);
    control.value = "changed";
    expect(selectionIsCurrent(selected)).toBe(false);
  });

  it("rejects blank, collapsed, outside and nested-control selections", () => {
    const root = area('<textarea>   word</textarea><div class="fynns-text-selection-composer"><textarea>inner</textarea></div>');
    const controls = root.querySelectorAll("textarea");
    controls[0].focus();
    controls[0].setSelectionRange(0, 3);
    expect(captureTextSelection(root)).toBeNull();
    controls[0].setSelectionRange(4, 4);
    expect(captureTextSelection(root)).toBeNull();
    controls[1].focus();
    controls[1].setSelectionRange(0, 3);
    expect(captureTextSelection(root)).toBeNull();
    expect(captureTextSelection(controls[1].parentElement!)).toMatchObject({ text: "inn" });
    const outside = document.createElement("textarea");
    document.body.append(outside);
    outside.value = "outside";
    outside.focus();
    outside.select();
    expect(captureTextSelection(root)).toBeNull();
  });

  it("captures a range across rendered elements and detects source replacement", () => {
    const root = area("<p>Alpha <strong>Beta</strong> Gamma</p>");
    const range = document.createRange();
    range.setStart(root.querySelector("p")!.firstChild!, 3);
    range.setEnd(root.querySelector("strong")!.firstChild!, 3);
    document.getSelection()!.addRange(range);
    const selected = captureTextSelection(root)!;
    expect(selected).toMatchObject({ text: "ha Bet", start: 3, end: 9 });
    expect(selectionIsCurrent(selected)).toBe(true);
    root.innerHTML = "<p>replacement</p>";
    expect(selectionIsCurrent(selected)).toBe(false);
  });
});
