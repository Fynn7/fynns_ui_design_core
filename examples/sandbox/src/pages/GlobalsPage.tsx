import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  Collapsible,
  Input,
  Select,
} from "@fynns/ui";

/**
 * Live stage proving `--fynns-radius-*` is system-wide: multiple primitives
 * share the same token ladder (not Card-only).
 */
export function GlobalsPage() {
  return (
    <div className="sandbox-globals">
      <p className="sandbox-globals-lead">
        Shape tokens (`--fynns-radius-*`) apply across the UI core. Tune the ladder in the
        inspector — every sample below updates from the same draft.
      </p>

      <section className="sandbox-globals-section" aria-label="Controls">
        <h3 className="sandbox-globals-heading">Controls</h3>
        <div className="sandbox-globals-row">
          <Button size="sm">Small</Button>
          <Button>Default</Button>
          <Button variant="primary">Primary</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          <Input placeholder="Input" aria-label="Sample input" />
          <Select
            ariaLabel="Sample select"
            value="one"
            options={["one", "two", "three"]}
            onChange={() => {}}
          />
        </div>
        <div className="sandbox-globals-row">
          <Badge>Neutral</Badge>
          <Badge variant="accent">Accent</Badge>
          <Badge variant="success">Success</Badge>
        </div>
      </section>

      <section className="sandbox-globals-section" aria-label="Surfaces">
        <h3 className="sandbox-globals-heading">Surfaces</h3>
        <div className="sandbox-globals-cards">
          {(["elevated", "filled", "outlined"] as const).map((variant) => (
            <Card key={variant} variant={variant} className="sandbox-globals-card">
              <CardHeader title={variant} subtitle="Shared radius-md" />
              <CardContent>Container shape follows the global ladder.</CardContent>
            </Card>
          ))}
        </div>
        <Collapsible title="Collapsible sample" defaultOpen>
          <p className="sandbox-help">Headers and panels also consume radius tokens.</p>
        </Collapsible>
      </section>

      <section className="sandbox-globals-section" aria-label="Radius swatches">
        <h3 className="sandbox-globals-heading">Ladder swatches</h3>
        <div className="sandbox-globals-swatches">
          {(["xs", "sm", "md", "lg", "xl"] as const).map((key) => (
            <div key={key} className="sandbox-globals-swatch">
              <div
                className="sandbox-globals-swatch-box"
                style={{ borderRadius: `var(--fynns-radius-${key})` }}
              />
              <code>{key}</code>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
