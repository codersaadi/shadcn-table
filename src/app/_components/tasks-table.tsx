"use client";

import type { Task } from "@/db/schema";
import * as React from "react";

import { DeleteTasksDialog } from "./delete-tasks-dialog";
import { AdvancedDataTable, createMultiAction, createSingleAction } from "./table-layout";
import { TasksTableActionBar } from "./tasks-table-action-bar";
import { getTasksTableColumns } from "./tasks-table-columns";
import { UpdateTaskSheet } from "./update-task-sheet";

// Define the structure of the metadata needed for the task table
interface TaskFilterMetadata {
  statusCounts: Record<Task["status"], number>;
  priorityCounts: Record<Task["priority"], number>;
  estimatedHoursRange: { min: number; max: number };
}

interface TasksTableProps {
  data: {
    data: Task[];
    pageCount: number;
  };
  statusCounts: Record<Task["status"], number>;
  priorityCounts: Record<Task["priority"], number>;
  estimatedHoursRange: { min: number; max: number };
}
type TasksTableActions = "update" | "delete"
export function TasksTable({
  data,
  statusCounts,
  priorityCounts,
  estimatedHoursRange,
}: TasksTableProps) {

  // Organize filter metadata into a structured object
  const filterMetadata: TaskFilterMetadata = {
    statusCounts,
    priorityCounts,
    estimatedHoursRange,
  };


  return (
    <AdvancedDataTable<Task, TasksTableActions, TaskFilterMetadata>
      tableData={data}
      filterMetadata={filterMetadata}
      getColumns={(metadata, setRowAction) =>
        getTasksTableColumns({
          statusCounts: metadata.statusCounts,
          priorityCounts: metadata.priorityCounts,
          estimatedHoursRange: metadata.estimatedHoursRange,
          setRowAction,
        })
      }
      getRowId={(task) => task.id}
      initialSorting={[{ id: "createdAt", desc: true }]}
      ActionBar={TasksTableActionBar}
      shallow={false}
      clearOnDefault={true}
      actions={{
        update: createSingleAction(UpdateTaskSheet),
        delete: createMultiAction(DeleteTasksDialog)
      }}
    />
  );
}