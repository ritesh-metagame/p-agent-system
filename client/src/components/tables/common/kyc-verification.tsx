"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import React from "react";

const KYCVerification = () => {
  const [date, setDate] = React.useState<Date>();

  return (
    <div className="bg-white rounded-lg w-full">
      <h1 className="text-2xl font-bold text-center mb-6">User Details</h1>
      <div className="flex justify-center gap-4 mb-6">
        <Button className="px-4 py-2 bg-yellow-400 text-white rounded-lg font-semibold">
          Pending
        </Button>
        <Button className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold">
          Verified
        </Button>
      </div>
      <form>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="block text-gray-700 font-medium mb-2">
              Full Name
            </Label>
            <Input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <Label className="block text-gray-700 font-medium mb-2">
              Date of Birth
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  className=""
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="block text-gray-700 font-medium mb-2">
              Gender
            </Label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Gender</SelectLabel>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="block text-gray-700 font-medium mb-2">
              Nationality
            </Label>
            <Input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
        <div className="mb-4">
          <Label className="block text-gray-700 font-medium mb-2">
            Address
          </Label>
          <Textarea
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            rows={3}
          ></Textarea>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div>
            <Label className="block text-gray-700 font-medium mb-2">
              Contact Number
            </Label>
            <div className="flex gap-2">
              <Input
                type="text"
                className="flex-1 px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <Button className="px-4 py-2 bg-blue-500 text-white rounded-r-lg">
                Verify
              </Button>
            </div>
          </div>
          <div>
            <Label className="block text-gray-700 font-medium mb-2">
              Email Address
            </Label>
            <div className="flex gap-2">
              <Input
                type="text"
                className="flex-1 px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <Button className="px-4 py-2 bg-blue-500 text-white rounded-r-lg">
                Verify
              </Button>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <Button
            type="submit"
            className="px-6 w-full py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600"
          >
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
};

export default KYCVerification;
