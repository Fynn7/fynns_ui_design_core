import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, type CardVariant } from "@fynns/ui";

type ControlSectionProps = {
  title: string;
  description?: string;
  variant: CardVariant;
  children: ReactNode;
};

export function ControlSection({
  title,
  description,
  variant,
  children,
}: ControlSectionProps) {
  return (
    <Card variant={variant} className="fynns-sandbox-control-section">
      <CardHeader title={title} subheader={description} titleAs="h2" />
      <CardContent padding="compact">
        <div className="fynns-sandbox-control-stack">{children}</div>
      </CardContent>
    </Card>
  );
}
