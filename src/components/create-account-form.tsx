"use client";

import React from "react";
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
});

export default function CreateAccountForm({ onSubmit }: Props) {
  const form = useForm<z.infer<typeof createAccountFormSchema>>({
    resolver: zodResolver(createAccountFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      mobileNumber: "",
      bankName: "",
      accountNumber: "",
    },
  });

  const role = useSelector((state: RootState) => state.authReducer.role);

  function handleSubmit(values: z.infer<typeof createAccountFormSchema>) {
    if (onSubmit) {
      onSubmit(values);
    }
    console.log(values);
  }

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
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
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
                    <Input placeholder="Doe" {...field} />
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
                    <Input placeholder="1234567890" {...field} />
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
                    <Input placeholder="Bank Name" {...field} />
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
                    <Input placeholder="Account Number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button variant="orange" type="submit" className="w-full">
              Submit
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
