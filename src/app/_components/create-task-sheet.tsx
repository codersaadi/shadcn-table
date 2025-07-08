"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import * as React from "react";
import { createTask } from "../_lib/actions";
import { createTaskSchema } from "../_lib/validations";
import { GenericFormSheet } from "./sub/form-sheet";
import { TaskForm } from "./task-form";

export function CreateTaskSheet() {
  const [open, setOpen] = React.useState(false);

  const trigger = (
    <Button variant="outline" size="sm">
      <Plus className="mr-2 h-4 w-4" />
      New task
    </Button>
  );

  return (
    <GenericFormSheet
      open={open}
      onOpenChange={setOpen}
      trigger={trigger} // <-- This will now work perfectly
      schema={createTaskSchema}
      onSubmit={createTask}
      defaultValues={{
        title: "",
        label: "bug",
        status: "todo",
        priority: "low",
        estimatedHours: 0,
      }}
      uiText={{
        title: "Create Task",
        description: "Fill in the details below to create a new task.",
        submitButton: "Create Task",
      }}
      renderForm={(form) => <TaskForm form={form} />}
    />
  );
}