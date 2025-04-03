"use client";
import React from "react";

/* eslint-disable @typescript-eslint/no-unused-vars */

import CreateAccountForm from "@/components/create-account-form";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RootState, useSelector } from "@/redux/store";

// import KYCVerification from "./tables/common/kyc-verification";

type Props = {
  onSubmit?: (values: z.infer<typeof createSiteFormSchema>) => void;
};

const createSiteFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  url: z.string().url({ message: "Enter a valid URL" }),
  description: z
    .string()
    .min(5, { message: "Description must be at least 5 characters" }),
});

export default function CreateSiteForm({ onSubmit }: Props) {
  const form = useForm<z.infer<typeof createSiteFormSchema>>({
    resolver: zodResolver(createSiteFormSchema),
    defaultValues: {
      name: "",
      url: "",
      description: "",
    },
  });

  const role = useSelector((state: RootState) => state.authReducer.role);

  function handleSubmit(values: z.infer<typeof createSiteFormSchema>) {
    if (onSubmit) {
      onSubmit(values);
    }
    console.log(values);
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-center">
          Create Site
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter site name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter site description" {...field} />
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
