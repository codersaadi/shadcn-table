import type { SearchParams } from "@/types";
import * as React from "react";

import { getValidFilters } from "@/lib/data-table";

import { TasksTable } from "../_components/tasks-table";
import {
  getEstimatedHoursRange,
  getTaskPriorityCounts,
  getTaskStatusCounts,
  getTasks,
} from "../_lib/queries";
import { searchParamsCache } from "../_lib/validations";

interface IndexPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function IndexPage(props: IndexPageProps) {
  const searchParams = await props.searchParams;
  const search = searchParamsCache.parse(searchParams);

  const validFilters = getValidFilters(search.filters);
  const tasks = await getTasks({
    ...search,
    filters: validFilters,
  })
  const statusCount = await getTaskStatusCounts()
  const priorityCount = await getTaskPriorityCounts()
  const estimatedHours = await getEstimatedHoursRange()

  return (

    <TasksTable priorityCounts={priorityCount} statusCounts={statusCount} estimatedHoursRange={estimatedHours} data={tasks} />
  );
}
