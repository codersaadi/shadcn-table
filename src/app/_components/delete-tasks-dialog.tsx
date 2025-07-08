"use client";

import type { Task } from "@/db/schema";
import type { Row } from "@tanstack/react-table";
import type * as React from "react";


import type { Dialog } from "@/components/ui/dialog";
import { deleteTasks } from "../_lib/actions";
import { GenericActionDialog } from "./sub/action-dialog";

interface DeleteTasksDialogProps
  extends React.ComponentPropsWithoutRef<typeof Dialog> {
  data: Row<(Task)>["original"][];
  showTrigger?: boolean;
  onSuccess?: () => void;
}

export function DeleteTasksDialog({
  data,
  showTrigger = true,
  ...props
}: DeleteTasksDialogProps) {

  return <GenericActionDialog
    {...props}
    action={"delete"}
    data={data}
    itemName="Task"
    onClick={(ids) => {
      return deleteTasks({ ids })
    }}
  />
}
