"use client";

import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { RootState, useSelector } from "@/redux/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import KYCVerification from "./tables/common/kyc-verification";

// //v2 add
// import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
// import {
//   Popover,
//   PopoverTrigger,
//   PopoverContent,
// } from "@/components/ui/popover";
// import { Circle, CircleDot } from "lucide-react"; // Icons for selection
// //v2 ends

type Props = {
  onSubmit?: (values: z.infer<typeof createAccountFormSchema>) => void;
};

const createAccountFormSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: "First name must be at least 2 characters" }),
  lastName: z
    .string()
    .min(2, { message: "Last name must be at least 2 characters" }),
  mobileNumber: z
    .string()
    .min(10, { message: "Mobile number must be at least 10 digits" })
    .regex(/^\d+$/, { message: "Mobile number must contain only digits" }),
  bankName: z.string().min(2, { message: "Bank name is required" }),
  accountNumber: z
    .string()
    .min(5, { message: "Account number must be at least 5 characters" })
    .regex(/^\d+$/, { message: "Account number must contain only digits" }),
  commissionPercentage: z
    .string()
    .transform((val) => parseFloat(val)) // Convert to number
    .refine((val) => !isNaN(val) && val >= 0 && val <= 100, {
      message: "Commission percentage must be between 0 and 100",
    }),
});

export default function CreateAccountForm({ onSubmit }: Props) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<string[][] | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof createAccountFormSchema>>({
    resolver: zodResolver(createAccountFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      mobileNumber: "",
      bankName: "",
      accountNumber: "",
      commissionPercentage: 0,
    },
  });

  const role = useSelector((state: RootState) => state.authReducer.role);

  function handleSubmit(values: z.infer<typeof createAccountFormSchema>) {
    if (onSubmit) {
      onSubmit(values);
    }
    console.log(values);
  }

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    setUploadedFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const rows = text.split("\n").map((row) => row.split(","));
        setCsvPreview(rows);
      };
      reader.readAsText(file);
    } else {
      setCsvPreview(null);
    }
  }

  function handleRemoveFile() {
    setUploadedFile(null);
    setCsvPreview(null);
  }

  function handlePreview() {
    setIsDialogOpen(true);
  }

  function closeDialog() {
    setIsDialogOpen(false);
  }

  // const options = ["Site 1", "Site 2", "Site 3"]; // Replace with real data
  // const [selected, setSelected] = useState<string[]>([]);

  // const toggleSelection = (item: string) => {
  //   setSelected((prev) =>
  //     prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
  //   );
  // };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-center">
          Create Account
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Bulk Upload via CSV
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline" className="w-full" type="button">
                  {uploadedFile ? "Change File" : "Upload CSV"}
                </Button>
              </div>
              {uploadedFile && (
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-600">
                    {uploadedFile.name}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={handlePreview}
                      className="text-sm text-blue-500 hover:underline"
                    >
                      Preview
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{uploadedFile?.name}</DialogTitle>
                  <DialogClose />
                </DialogHeader>
                <div className="overflow-auto max-h-96">
                  <table className="w-full text-sm text-left text-gray-700">
                    <thead>
                      <tr>
                        {csvPreview?.[0]?.map((header, index) => (
                          <th key={index} className="px-2 py-1 border-b">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreview?.slice(1).map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="px-2 py-1 border-b">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </DialogContent>
            </Dialog>

            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John"
                      {...field}
                      disabled={!!uploadedFile}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Doe"
                      {...field}
                      disabled={!!uploadedFile}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mobileNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="1234567890"
                      {...field}
                      disabled={!!uploadedFile}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Name for Settlement</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Bank Name"
                      {...field}
                      disabled={!!uploadedFile}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Account Number for Settlement</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Account Number"
                      {...field}
                      disabled={!!uploadedFile}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full">
                  {selected.length ? selected.join(", ") : "Select Sites"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-2">
                <Command>
                  <CommandGroup>
                    {options.map((item) => (
                      <CommandItem
                        key={item}
                        onSelect={() => toggleSelection(item)}
                      >
                        <div className="flex items-center gap-2">
                          {selected.includes(item) ? (
                            <CircleDot className="text-orange-500" />
                          ) : (
                            <Circle className="text-gray-400" />
                          )}
                          <span>{item}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover> */}

            <FormField
              control={form.control}
              name="commissionPercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Commission Percentage</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Commission Percentage"
                      {...field}
                      disabled={!!uploadedFile}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Dialog>
              <DialogTrigger>
                <Button
                  variant="outline"
                  type="button"
                  className="w-full"
                  onClick={() => console.log("Update KYC clicked")}
                >
                  Update KYC
                </Button>
              </DialogTrigger>
              <DialogContent className="">
                <DialogHeader>
                  <DialogTitle>Update KYC</DialogTitle>
                  <DialogDescription>Update KYC for the user</DialogDescription>
                </DialogHeader>
                <div className="w-full">
                  <KYCVerification />
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="orange"
              type="submit"
              className="w-full"
              disabled={!!uploadedFile}
            >
              Submit
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
