"use client";

import type { Table } from "@tanstack/react-table";
import { Check, Eye, EyeOff, Grid3X3, Search, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import * as React from "react";

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
}

export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  const [open, setOpen] = React.useState(false);

  const columns = React.useMemo(
    () =>
      table
        .getAllColumns()
        .filter(
          (column) =>
            typeof column.accessorFn !== "undefined" && column.getCanHide(),
        ),
    [table],
  );

  const visibleCount = columns.filter(col => col.getIsVisible()).length;
  const totalCount = columns.length;

  const toggleAllColumns = () => {
    const allVisible = columns.every(col => col.getIsVisible());
    for (const col of columns) {
      col.toggleVisibility(!allVisible);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          aria-label="Customize table columns"
          role="combobox"
          variant="outline"
          size="sm"
          className="group glass hover:glass-strong relative ml-auto hidden h-9 border-border/60 px-4 shadow-modern transition-smooth hover:border-primary/40 hover:shadow-modern-lg lg:flex"
        >
          <div className="flex items-center gap-2">
            <Grid3X3 className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
            <span className="group-hover:gradient-text font-medium text-foreground">
              Columns
            </span>
            <Badge
              variant="secondary"
              className="ml-1 h-5 min-w-[20px] bg-secondary/80 font-semibold text-secondary-foreground text-xs transition-smooth group-hover:bg-primary/10 group-hover:text-primary"
            >
              {visibleCount}/{totalCount}
            </Badge>
          </div>
          <div className="gradient-primary absolute inset-0 rounded-md opacity-0 transition-smooth group-hover:opacity-10" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="glass-strong w-72 animate-scale-in border-0 p-0 shadow-modern-xl"
        sideOffset={8}
      >

        <Command className="border-0 bg-transparent">
          <div className="border-border/30 border-b">
            <div className="relative">
              <Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
              <CommandInput
                placeholder="Search columns..."
                className="border-0 bg-transparent py-4 pl-10 text-sm placeholder:text-muted-foreground focus:ring-0"
              />
            </div>
          </div>

          <div className="p-3">
            {/* biome-ignore lint/nursery/useSortedClasses: <explanation> */}
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                Column Visibility
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleAllColumns}
                className="h-6 px-2 text-xs transition-smooth hover:bg-accent"
              >
                {visibleCount === totalCount ? 'Hide All' : 'Show All'}
              </Button>
            </div>

            <CommandList className="max-h-64">
              <CommandEmpty className="py-8 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Search className="h-8 w-8 text-muted-foreground/50" />
                  <p className="text-muted-foreground text-sm">No columns found</p>
                  <p className="text-muted-foreground/70 text-xs">Try adjusting your search</p>
                </div>
              </CommandEmpty>

              <CommandGroup className="space-y-1">
                {columns.map((column, index) => {
                  const isVisible = column.getIsVisible();
                  return (
                    <CommandItem
                      key={column.id}
                      onSelect={() => {
                        column.toggleVisibility(!isVisible);
                      }}
                      className="group flex cursor-pointer items-center gap-3 rounded-lg border border-transparent p-3 transition-smooth hover:border-border/50 hover:bg-accent/50"
                    >
                      <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-md transition-smooth",
                        isVisible
                          ? "bg-background text-primary shadow-glow"
                          : "bg-muted group-hover:bg-accent group-hover:text-accent-foreground"
                      )}>
                        {isVisible ? (
                          <Eye className="h-4 w-4 text-primary" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-primary" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <span className={cn(
                          "block truncate font-medium text-sm transition-colors",
                          isVisible ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {column.columnDef.meta?.label ?? column.id}
                        </span>
                        <span className="mt-0.5 block text-muted-foreground/70 text-xs">
                          {isVisible ? "Currently visible" : "Currently hidden"}
                        </span>
                      </div>

                      <Check
                        className={cn(
                          "h-4 w-4 transition-smooth",
                          isVisible
                            ? "scale-100 text-success opacity-100"
                            : "scale-75 opacity-0"
                        )}
                      />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </div>

          <Separator className="bg-border/50" />

          <div className="bg-accent/20 p-3">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span>Total columns: {totalCount}</span>
              <span className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-success" />
                {visibleCount} visible
              </span>
            </div>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
}