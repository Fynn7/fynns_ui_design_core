# In-flow section notices

`SectionNotice` owns persistent feedback at the affected section when a short
message needs optional details or an action. Live sandbox: `#section-notice`.
Use `InlineAlert` for plain phrasing copy, `snackbar` for transient operation
feedback, and `WorkspaceNoticeStack` for persistent canvas overlays.

The design follows the dedicated actions in
[Atlassian Section message](https://developer.atlassian.com/platform/forge/ui-kit/components/section-message/)
and the actionable notification distinction in
[Carbon notifications](https://www.carbondesignsystem.com/building-blocks/core/components/notification/guidelines).
Core supplies a quiet tonal surface, semantic icon, optional heading, wrapping
body, ghost actions and a built-in text disclosure. Details expand in document
flow; they are never a nested card, full-width filled button or modal.

```tsx
<SectionNotice
  severity="warning"
  message={cachedListMessage}
  details={{ text: connectionDetails, showLabel, hideLabel }}
  actions={[{ label: refreshLabel, onClick: refresh, disabled: refreshing }]}
/>
```

`message`, `heading`, detail text/labels and action labels are strings. There
are no children or arbitrary ReactNode slots. Core owns disclosure state,
`aria-expanded`/`aria-controls` and native button keyboard activation. Details
are hidden from both layout and accessibility until expanded. At most two
actions may accompany details; use short, specific localized labels.

Never nest `Collapsible`, `List`, `FieldStack`, buttons, links or other controls
inside `InlineAlert.message` or its children. Simple inline emphasis is allowed;
an action or layout requires a dedicated primitive or a sibling composition.
The consumer export gate rejects non-phrasing JSX in InlineAlert. It is a static
same-file check; dynamic and cross-file content still needs browser review.

`onDismiss` hides presentation only. Keep the unresolved business state and
make recovery reachable elsewhere if the notice can be dismissed. A successful
refresh may replace the warning with success or remove it; a failed refresh
must retain cached content and provide clear failure feedback. Do not force a
notice to stretch or override its inner padding, buttons or colors.
