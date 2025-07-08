// config/table-filter-modes.ts
import { CommandIcon, FileSpreadsheetIcon } from "lucide-react";

export type TableFilterModeConfig = typeof tableFilterModeConfig;

export const tableFilterModeConfig = {
  modes: [
    {
      label: "Detailed Filters",
      value: "expert" as const,
      icon: FileSpreadsheetIcon,
      description:
        "Comprehensive filtering with multiple conditions and operators",
      tooltipTitle: "Expert Filter Mode",
      tooltipDescription:
        "Excel/Airtable-style advanced filtering with complex conditions and logical operators.",
    },
    {
      label: "Quick Command",
      value: "command" as const,
      icon: CommandIcon,
      description: "Quick filtering through command-based interface",
      tooltipTitle: "Quick Filter Mode",
      tooltipDescription:
        "Linear-style command palette for rapid filtering with keyboard shortcuts.",
    },
  ],
} as const;

export type TableFilterMode = TableFilterModeConfig["modes"][number]["value"];
