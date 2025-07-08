"use client";

import type { Task } from "@/db/schema";
import * as React from "react";
import { updateTask } from "../_lib/actions";
import { type UpdateTaskSchema, updateTaskSchema } from "../_lib/validations";
import { GenericFormSheet } from "./sub/form-sheet";
import { TaskForm } from "./task-form"; // Your form fields component is still needed

interface UpdateTaskSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: Task | null;
  onSuccess?: () => void;
}

export function UpdateTaskSheet({ data, ...props }: UpdateTaskSheetProps) {
  if (!data) return null;
  const defaultValues = {
    title: data.title ?? "",
    label: data.label ?? "bug",
    status: data.status ?? "todo",
    priority: data.priority ?? "low",
    estimatedHours: data.estimatedHours ?? 0,
  } as Partial<UpdateTaskSchema>;
  return (
    <GenericFormSheet
      {...props} // Passes open, onOpenChange, onSuccess
      schema={updateTaskSchema}
      onSubmit={async (input) => {
        const res = await updateTask({ id: data.id, ...input });
        return {
          error: res.error,
          success: !res.error,

        }
      }}
      defaultValues={defaultValues}
      uiText={{
        title: "Update Task",
        description: "Update the task details and save the changes.",
        submitButton: "Save Changes",
      }}
      renderForm={(form) => <TaskForm form={form} />}
    />
  );
}
