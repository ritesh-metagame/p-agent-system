import React from "react";
// import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import {
  transactionsReportsListColumns,
  TransactionsReportsListData,
} from "../common-column-defs/common-transactions-columns";

import { TypographyH2 } from "@/components/ui/typographyh2";
import { DataTable } from "@/components/tables/data-table";
import Data from "./common-transactions.json";

type Props = {};

const transactionsReportsListData: TransactionsReportsListData[] =
  Data.transactionsReportsListData || [];

function DatePicker({ placeholder }: { placeholder: string }) {
  const [date, setDate] = React.useState<Date | undefined>();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-48 justify-between truncate text-ellipsis px-3"
        >
          <span className={date ? "text-black" : "text-gray-500"}>
            {date ? format(date, "PPP") : placeholder}
          </span>
          <CalendarIcon className="ml-2 flex-shrink-0 text-gray-500" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={date} onSelect={setDate} />
      </PopoverContent>
    </Popover>
  );
}

export default function Transactions({}: Props) {
  return (
    <div>
      <div className="container mb-10">
        <div className="mb-10">
          <TypographyH2 className="mb-4">Reports List</TypographyH2>

          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1 ml-2">
                START DATE
              </label>
              <DatePicker placeholder="DD/MM/YY" />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1 ml-2">
                END DATE
              </label>
              <DatePicker placeholder="DD/MM/YY" />
            </div>
            <Button className="mt-6 bg-[#29467C] text-white hover:bg-[#1f355f]">
              Search
            </Button>
          </div>

          <DataTable
            columns={transactionsReportsListColumns}
            data={transactionsReportsListData}
            columnWidths={["250px", "250px", "250px", "250px", "250px"]}
          />
        </div>
      </div>
    </div>
  );
}
