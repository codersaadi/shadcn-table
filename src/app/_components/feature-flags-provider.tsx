"use client";

import { useQueryState } from "nuqs";
import * as React from "react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  type TableFilterMode,
  type TableFilterModeConfig,
  tableFilterModeConfig
} from "@/config/flag";
import { cn } from "@/lib/utils";

interface TableFilterModeContextValue {
  currentMode: TableFilterMode | null;
  isAdvancedFilteringEnabled: boolean;
  isCommandFilteringEnabled: boolean;
  setFilterMode: (mode: TableFilterMode | null) => void;
}

const TableFilterModeContext = React.createContext<TableFilterModeContextValue | null>(null);

export function useTableFilterMode(): TableFilterModeContextValue {
  const context = React.useContext(TableFilterModeContext);
  if (!context) {
    throw new Error(
      "useTableFilterMode must be used within a TableFilterModeProvider"
    );
  }
  return context;
}

interface TableFilterModeProviderProps {
  children: React.ReactNode;
}

export function TableFilterModeProvider({ children }: TableFilterModeProviderProps) {
  const [currentMode, setCurrentMode] = useQueryState<TableFilterMode | null>(
    "tableFilterMode",
    {
      parse: (value) => {
        if (!value) return null;
        const validModes = tableFilterModeConfig.modes.map((mode) => mode.value);
        return validModes.includes(value as TableFilterMode)
          ? (value as TableFilterMode)
          : null;
      },
      serialize: (value) => value ?? "",
      defaultValue: null,
      clearOnDefault: true,
      shallow: false,
      eq: (a, b) => (!a && !b) || a === b,
    }
  );

  const handleModeChange = React.useCallback(
    (mode: string) => {
      const newMode = mode as TableFilterMode;
      setCurrentMode(currentMode === newMode ? null : newMode);
    },
    [currentMode, setCurrentMode]
  );

  const contextValue = React.useMemo(
    (): TableFilterModeContextValue => ({
      currentMode,
      isAdvancedFilteringEnabled: currentMode === "expert",
      isCommandFilteringEnabled: currentMode === "command",
      setFilterMode: setCurrentMode,
    }),
    [currentMode, setCurrentMode]
  );

  return (
    <TableFilterModeContext.Provider value={contextValue}>
      <div className="flex items-center gap-4">
        <span className="font-medium text-muted-foreground text-sm">
          Filter Mode:
        </span>
        <ToggleGroup
          type="single"
          value={currentMode ?? ""}
          onValueChange={handleModeChange}
          className="justify-start"
        >
          {tableFilterModeConfig.modes.map((mode) => (
            <Tooltip key={mode.value}>
              <TooltipTrigger asChild>
                <ToggleGroupItem
                  value={mode.value}
                  aria-label={`Enable ${mode.label}`}
                  className={cn("flex items-center gap-2", mode.value === currentMode ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
                >
                  <mode.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{mode.label}</span>
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <div className="space-y-1">
                  <p className="font-bold ">{mode.tooltipTitle}</p>
                  <p className="text-background/80 text-sm">
                    {mode.tooltipDescription}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </ToggleGroup>
      </div>
      {children}
    </TableFilterModeContext.Provider>
  );
}