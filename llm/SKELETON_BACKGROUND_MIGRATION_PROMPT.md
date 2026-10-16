# Consumer task: transparent skeleton backgrounds

Paste the task below into the affected consumer repository.

```text
Fix content-loading skeletons that introduce a black or tinted rectangular
background. Follow the repository's AGENTS.md and the core loading contract.

1. Resolve the app package's actual @fynns/ui alias, @fynn7/ui-design-core
   file dependency and installed real path. Update the consumed core source
   to version 0.5.311 or newer, retaining the project's existing installation
   model. A pinned vendor snapshot needs an explicit reviewed source update;
   updating an unrelated sibling checkout or only changing version metadata
   is insufficient. Do not introduce registry authentication or runtime CSS
   patches. Refresh source through the project's established dependency update
   process rather than hand-editing installed core implementation files.
2. Read docs/design-system/loading.md, llm/CONSUMER_TREATY.md and the updated
   consumer-AGENTS.md / consumer-cursor-rule.mdc. Merge the background rule
   into existing consumer guidance without overwriting project-owned rules.
3. Audit all LoadingSkeleton, BusyRegion and BusyScrim call sites and their
   wrappers. Skeletons paint only bars; root, wrappers and skeleton backdrops
   stay transparent, without black/tinted panels, dimming wash, backdrop blur
   or shadow panels. Preserve the original host theme surface. Remove local
   loading-background overrides; do not restyle .fynns-* or add !important.
   Keep loaded children mounted, hidden and inert while busy. Keep one loading
   representation per wait. Reserve fill for height-resolved panes, retain
   core insets and let rows adapt; do not add a fixed six-row whole-pane wait.
4. AppLoadingScreen keeps an opaque theme background and centered logo sweep.
   Blocking BusyScrim skeletons still trap focus/block input. Real value-based
   progress and archived compatibility masks retain their behavior. Preserve
   errors, retry, cancellation, timeout and completed-empty states.
5. Run core check:consumers -- --target <actual-app-package>, then the app's
   own typecheck/build and applicable lint/tests. Use a fresh browser context
   with fictional fixtures; delay/mock requests to inspect cold-start,
   navigation and refresh over mounted content. Verify dark/light themes,
   normal/reduced motion and narrow/desktop widths. Check the actual loaded
   CSS: skeleton overlays compute transparent backgrounds, background-image
   none and backdrop-filter none. Between bars the host background must be
   unchanged. No dark rectangle, blur, overflow or layout jump. Verify busy
   exits on success/failure/cancel/timeout, retry works, and loaded content
   becomes interactive again. Capture only fictional fixture screenshots.
6. Report source version/real path, changed call sites/rules, commands/results
   and browser evidence. Distinguish source compatibility from actual runtime
   verification. Do not claim the consumer fix is live before its consumed
   source is updated and browser loading states are verified.
```
