import { DataTableSkeleton } from '@/components/data-table-skeleton'
import { Shell } from '@/components/shell'
import React from 'react'
import { TableFilterModeProvider } from '../_components/feature-flags-provider'

export default function TableLayoutRSC({ children }: {
    children: React.ReactNode
}) {
    return (
        <Shell>
            <TableFilterModeProvider>
                <React.Suspense
                    fallback={
                        <DataTableSkeleton
                            columnCount={7}
                            filterCount={2}
                            cellWidths={[
                                "10rem",
                                "30rem",
                                "10rem",
                                "10rem",
                                "6rem",
                                "6rem",
                                "6rem",
                            ]}

                            shrinkZero
                        />
                    } />
                {children}
            </TableFilterModeProvider>
        </Shell>
    )
}
