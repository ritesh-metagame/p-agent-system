"use client";

import React from "react";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

type Props = {
  onSubmit?: (values: z.infer<typeof createAccountFormSchema>) => void;
  roleOptions: string[];
  categoryOptions: string[];
};

const createAccountFormSchema = z.object({
  firstName: z.string().min(2, { message: "First name is required" }),
  lastName: z.string().min(2, { message: "Last name is required" }),
  username: z.string().min(2, { message: "Username is required" }),
  mobileNumber: z
    .string()
    .min(10, { message: "Enter a valid mobile number" })
    .regex(/^\d+$/, { message: "Must contain only numbers" }),
  bankName: z.string().min(2, { message: "Bank name is required" }),
  accountNumber: z
    .string()
    .min(5, { message: "Account number must be at least 5 digits" })
    .regex(/^\d+$/, { message: "Must contain only numbers" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
  // role: z.string().min(1, { message: "Role is required" }),
  // categorySections: z.array(
  //   z.object({
  //     category: z.string().min(1, { message: "Category is required" }),
  //     commissionPercentage: z
  //       .string()
  //       .transform((val) => parseFloat(val))
  //       .refine((val) => !isNaN(val) && val >= 0 && val <= 100, {
  //         message: "Commission must be between 0 and 100",
  //       }),
  //   })
  // ),
});

export default function CreateAccountForm({
  onSubmit,
  roleOptions,
  categoryOptions,
}: Props) {
  const form = useForm<z.infer<typeof createAccountFormSchema>>({
    resolver: zodResolver(createAccountFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      mobileNumber: "",
      bankName: "",
      accountNumber: "",
      password: "",
      // role: "",
      // categorySections: [],
    },
  });

  // const { fields, append } = useFieldArray({
  //   control: form.control,
  //   name: "categorySections",
  // });

  // // Helper to get selected categories
  // const selectedCategories = form
  //   .watch("categorySections")
  //   .map((c) => c.category);

  // Replace this with your actual method for retrieving the token.
  // const token = "YOUR_AUTHORIZATION_TOKEN";

  async function handleSubmit(values: z.infer<typeof createAccountFormSchema>) {
    // If you have an onSubmit prop, call it with full form values if needed.
    if (onSubmit) {
      onSubmit(values);
    }
    console.log("Full Form Values:", values);

    // Extract only the fields needed by your API
    const payload = {
      username: values.username,
      password: values.password,
      firstname: values.firstName,
      lastname: values.lastName,
      mobileNumber: values.mobileNumber,
      bankName: values.bankName,
      accountNumber: values.accountNumber,
    };

    try {
      const response = await fetch("http://localhost:8080/api/v1/user/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Handle error response
        const errorData = await response.json();
        console.error("Error creating account:", errorData);
        // Optionally, show a message to the user
      } else {
        const data = await response.json();
        console.log("Account created successfully:", data);
        // Optionally, perform further actions on success (e.g., navigate away)
      }
    } catch (error) {
      console.error("Network error:", error);
      // Optionally, show a network error message to the user
    }
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
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
            {/* First Name */}
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

            {/* Last Name */}
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

            {/* Mobile Number */}
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

            {/* Bank Name */}
            <FormField
              control={form.control}
              name="bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Bank Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Account Number */}
            <FormField
              control={form.control}
              name="accountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Account Number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Username */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="johndoe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Role Dropdown */}
            {/* <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((role, index) => (
                        <SelectItem key={index} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

            {/* Submit Button */}
            <Button
              variant="default"
              type="submit"
              className="w-full bg-blue-500 text-white"
            >
              Submit
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
