"use client";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CircleHelp } from "lucide-react";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  columnWidths?: string[];
  tooltips?: { [key: string]: string }; // New prop for tooltip information
}

export function DataTable<TData, TValue>({
  columns,
  data,
  columnWidths = [],
  tooltips = {}, // Default to empty object
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const accumulativeWidths = columns.reduce(
    (acc, column) => {
      const width = columnWidths[acc.index] || "250px";
      acc.widths.push(width);
      acc.total += parseInt(width, 10);
      acc.index++;
      return acc;
    },
    { widths: [], total: 0, index: 0 }
  );

  console.log({ accumulativeWidths });

  return (
    <div className="rounded-md">
      <ScrollArea
        className={`w-screen md-[${accumulativeWidths.total + 80}px]`}
      >
        <Table className="w-max border rounded-md">
          <TableHeader className="bg-table-header">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header, index) => {
                  const tooltip = tooltips[header.id];
                  return (
                    <TableHead
                      className="text-white text-left first:rounded-tl-md last:rounded-tr-md"
                      key={header.id}
                      style={{ width: columnWidths[index] || "250px" }}
                    >
                      <div className="flex items-center space-x-1">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}

                        {tooltip && (
                          <div className="relative group">
                            <CircleHelp className="h-4 w-4 text-gray-400 cursp" />
                            <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-1 px-2 left-0 transform -translate-x-1/4 -translate-y-full w-48 min-w-max">
                              {tooltip}
                            </div>
                          </div>
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell, index) => (
                    <TableCell
                      key={cell.id}
                      style={{ width: columnWidths[index] || "auto" }} // Apply column width
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
