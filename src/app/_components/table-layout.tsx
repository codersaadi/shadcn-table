"use client";

import { DataTable } from "@/components/data-table";
import { DataTableAdvancedToolbar } from "@/components/data-table-advanced-toolbar";
import { DataTableFilterList } from "@/components/data-table-filter-list";
import { DataTableFilterMenu } from "@/components/data-table-filter-menu";
import { DataTableSortList } from "@/components/data-table-sort-list";
import { DataTableToolbar } from "@/components/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import type { DataTableRowAction, ExtendedColumnSort } from "@/types/data-table";
import type { ColumnDef, Row, Table } from "@tanstack/react-table";
import * as React from "react";
import { useTableFilterMode } from "./feature-flags-provider";

// Base action dialog props
interface BaseActionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    showTrigger?: boolean;
    onSuccess?: () => void;
}

interface SingleItemActionDialogProps<TData> extends BaseActionDialogProps {
    data: TData | null;
}

interface MultiItemActionDialogProps<TData> extends BaseActionDialogProps {
    data: TData[];
}

interface TableData<TData> {
    data: TData[];
    pageCount: number;
}

// Separate action configurations for better type safety
interface SingleActionConfig<TData extends Record<string, unknown>> {
    component: React.ComponentType<SingleItemActionDialogProps<TData>>;
    dataType: "single";
    shouldDeselectOnSuccess?: boolean;
}

interface MultiActionConfig<TData extends Record<string, unknown>> {
    component: React.ComponentType<MultiItemActionDialogProps<TData>>;
    dataType: "multi";
    shouldDeselectOnSuccess?: boolean;
}

// Union type for action configurations
type ActionConfig<TData extends Record<string, unknown>> =
    | SingleActionConfig<TData>
    | MultiActionConfig<TData>;

// Type-safe action registry
type ActionRegistry<TData extends Record<string, unknown>, TActions extends string> = {
    [K in TActions]?: ActionConfig<TData>;
};

interface AdvancedDataTableProps<
    TData extends Record<string, unknown>,
    TActions extends string = string,
    TFilterMetadataSchema = unknown
> {
    tableData: TableData<TData>;
    filterMetadata: TFilterMetadataSchema;
    getColumns: (
        filterMetadata: TFilterMetadataSchema,
        setRowAction: (action: DataTableRowAction<TData> | null) => void
    ) => ColumnDef<TData, unknown>[];
    getRowId: (row: TData) => string;
    initialSorting?: ExtendedColumnSort<TData>[];
    initialColumnPinning?: { left?: string[]; right?: string[] };
    ActionBar?: React.ComponentType<{ table: Table<TData> }>;
    shallow?: boolean;
    debounceMs?: number;
    throttleMs?: number;
    actions?: ActionRegistry<TData, TActions>;
    clearOnDefault?: boolean;
}

// Constants
const DEFAULT_INITIAL_PINNING = { right: ["actions"] };

// Helper function overloads for better type safety
export function createSingleAction<TData extends Record<string, unknown>>(
    component: React.ComponentType<SingleItemActionDialogProps<TData>>,
    options?: { shouldDeselectOnSuccess?: boolean }
): SingleActionConfig<TData> {
    return {
        component,
        dataType: "single",
        shouldDeselectOnSuccess: true,
        ...options,
    };
}

export function createMultiAction<TData extends Record<string, unknown>>(
    component: React.ComponentType<MultiItemActionDialogProps<TData>>,
    options?: { shouldDeselectOnSuccess?: boolean }
): MultiActionConfig<TData> {
    return {
        component,
        dataType: "multi",
        shouldDeselectOnSuccess: true,
        ...options,
    };
}

// Generic action creator (less type-safe but more flexible)
export function createAction<TData extends Record<string, unknown>>(
    config: ActionConfig<TData>
): ActionConfig<TData> {
    return {
        shouldDeselectOnSuccess: true,
        ...config,
    };
}

export function AdvancedDataTable<
    TData extends Record<string, unknown>,
    TActions extends string = string,
    TFilterMetadataSchema = unknown
>({
    tableData,
    filterMetadata,
    getColumns,
    getRowId,
    initialSorting = [],
    initialColumnPinning = DEFAULT_INITIAL_PINNING,
    ActionBar,
    shallow = false,
    actions = {},
    clearOnDefault = true,
}: AdvancedDataTableProps<TData, TActions, TFilterMetadataSchema>) {
    const { isAdvancedFilteringEnabled, currentMode } = useTableFilterMode();
    const isExpertMode = currentMode === "expert";

    const { data, pageCount } = tableData;
    const [rowAction, setRowAction] = React.useState<DataTableRowAction<TData> | null>(null);

    // Memoize columns to prevent unnecessary re-renders
    const columns = React.useMemo(
        () => getColumns(filterMetadata, setRowAction),
        [filterMetadata, getColumns]
    );

    // Initialize data table with proper configuration
    const {
        table,
        shallow: tableShallow,
        debounceMs: tableDebounceMs,
        throttleMs: tableThrottleMs,
    } = useDataTable({
        data,
        columns,
        pageCount,
        enableAdvancedFilter: isAdvancedFilteringEnabled,
        initialState: {
            sorting: initialSorting,
            columnPinning: initialColumnPinning,
        },
        getRowId,
        shallow,
        clearOnDefault,
    });

    // Action success handler
    const handleActionSuccess = React.useCallback(
        (actionVariant: string) => {
            const actionConfig = actions[actionVariant as TActions];

            if (actionConfig?.shouldDeselectOnSuccess && rowAction?.row) {
                (rowAction.row as Row<TData>).toggleSelected(false);
            }

            setRowAction(null);
        },
        [actions, rowAction]
    );

    const handleCloseDialog = React.useCallback(() => {
        setRowAction(null);
    }, []);

    // Type-safe action dialog rendering with proper type discrimination
    const renderActionDialog = React.useCallback(
        (variant: string, config: ActionConfig<TData>) => {
            if (!rowAction || rowAction.variant !== variant) {
                return null;
            }

            const baseProps = {
                open: true,
                onOpenChange: handleCloseDialog,
                showTrigger: false,
                onSuccess: () => handleActionSuccess(variant),
            };

            const original = rowAction.row?.original;

            // Type-safe rendering based on action configuration
            if (config.dataType === "single") {
                const SingleComponent = config.component;
                return (
                    <SingleComponent
                        key={`action-dialog-${variant}`}
                        {...baseProps}
                        data={original ?? null}
                    />
                );
            }
            const MultiComponent = config.component;
            return (
                <MultiComponent
                    key={`action-dialog-${variant}`}
                    {...baseProps}
                    data={original ? [original] : []}
                />
            );
        },
        [rowAction, handleCloseDialog, handleActionSuccess]
    );

    // Render toolbar based on filtering mode
    const renderToolbar = () => {
        const commonProps = {
            table,
            shallow: tableShallow,
            debounceMs: tableDebounceMs,
            throttleMs: tableThrottleMs,
        };

        if (isAdvancedFilteringEnabled) {
            return (
                <DataTableAdvancedToolbar table={table}>
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            {isExpertMode ? (
                                <DataTableFilterList {...commonProps} align="start" />
                            ) : (
                                <DataTableFilterMenu {...commonProps} />
                            )}
                            <DataTableSortList table={table} align="start" />
                        </div>
                    </div>
                </DataTableAdvancedToolbar>
            );
        }

        return (
            <DataTableToolbar table={table}>
                <div className="flex items-center justify-end">
                    <DataTableSortList table={table} align="end" />
                </div>
            </DataTableToolbar>
        );
    };

    // Render all configured action dialogs
    const actionDialogs = React.useMemo(() => {
        return Object.entries(actions).reduce<React.ReactNode[]>((acc, [variant, config]) => {
            if (config) {
                const dialog = renderActionDialog(variant, config as ActionConfig<TData>);
                if (dialog) acc.push(dialog);
            }
            return acc;
        }, []);
    }, [actions, renderActionDialog]);

    return (
        <div className="max-w-7xl space-y-4 overflow-x-auto">
            <div>
                <DataTable
                    table={table}
                    actionBar={ActionBar ? <ActionBar table={table} /> : undefined}
                >
                    <div className="px-4 py-3">
                        {renderToolbar()}
                    </div>
                </DataTable>
            </div>
            {actionDialogs}
        </div>
    );
}

