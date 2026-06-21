import type { SVGProps } from "react";

/**
 * Minimal inline icon set so the core has zero icon-library dependency.
 * Consumers may pass their own icon nodes to components that accept them.
 */
export type IconProps = Omit<SVGProps<SVGSVGElement>, "ref"> & { size?: number };

function svgProps({ size = 16, ...rest }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...rest,
  };
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function ChevronUpIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...svgProps({ strokeWidth: 2.5, ...props })}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function InfoIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function AlertCircleIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

export function AlertTriangleIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function SaveIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

export function PencilIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function RocketIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

export function RefreshIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}

export function ArchiveIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <rect x="3" y="3" width="18" height="5" rx="1" />
      <path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  );
}

export function FileIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

export function FolderOpenIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M6 14l1.5-3.5A2 2 0 0 1 9.3 9.3H20a1 1 0 0 1 .95 1.3l-1.6 5.4A2 2 0 0 1 17.4 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.7.9l.8 1.2a2 2 0 0 0 1.7.9H18a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export function UndoIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M9 14 4 9l5-5" />
      <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
    </svg>
  );
}

export function DownloadIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

export function ScrollTextIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M15 12h-5" />
      <path d="M15 8h-5" />
      <path d="M19 17V5a2 2 0 0 0-2-2H4" />
      <path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3" />
    </svg>
  );
}

export function TerminalIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m6 9 3 3-3 3" />
      <line x1="13" y1="15" x2="17" y2="15" />
    </svg>
  );
}

export function BotIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <rect x="4" y="8" width="16" height="12" rx="2" />
      <path d="M12 5v3" />
      <circle cx="12" cy="4" r="1" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M9 13v2" />
      <path d="M15 13v2" />
    </svg>
  );
}

export function SparklesIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M9.94 14.06A2 2 0 0 0 8.5 12.62l-4.6-1.18a.5.5 0 0 1 0-.96l4.6-1.18A2 2 0 0 0 9.94 7.9l1.18-4.6a.5.5 0 0 1 .96 0l1.18 4.6a2 2 0 0 0 1.44 1.44l4.6 1.18a.5.5 0 0 1 0 .96l-4.6 1.18a2 2 0 0 0-1.44 1.44l-1.18 4.6a.5.5 0 0 1-.96 0z" />
      <path d="M19 3v4" />
      <path d="M21 5h-4" />
      <path d="M5 18v2" />
      <path d="M6 19H4" />
    </svg>
  );
}

export function PlugIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M12 22v-5" />
      <path d="M9 8V2" />
      <path d="M15 8V2" />
      <path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z" />
    </svg>
  );
}

export function CpuIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
      <path d="M9 2v2" />
      <path d="M15 2v2" />
      <path d="M9 20v2" />
      <path d="M15 20v2" />
      <path d="M2 9h2" />
      <path d="M2 15h2" />
      <path d="M20 9h2" />
      <path d="M20 15h2" />
    </svg>
  );
}

export function MessageSquareIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export function BarChartIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M3 3v18h18" />
      <path d="M8 17v-3" />
      <path d="M13 17V7" />
      <path d="M18 17v-6" />
    </svg>
  );
}
