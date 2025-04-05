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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { useSonner } from "sonner";
import { redirect, useRouter } from "next/navigation";

// ✅ Define form schema
const createSiteFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  url: z.string().url({ message: "Enter a valid URL" }),
  description: z
    .string()
    .min(5, { message: "Description must be at least 5 characters" }),
});

export default function CreateSiteForm() {
  const form = useForm<z.infer<typeof createSiteFormSchema>>({
    resolver: zodResolver(createSiteFormSchema),
    defaultValues: {
      name: "",
      url: "",
      description: "",
    },
  });

  const router = useRouter();

  // ✅ State for showing success popup
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const sonner = useSonner();

  // ✅ Get authentication token (stored in localStorage)
  const token = localStorage.getItem("token");

  async function handleSubmit(values: z.infer<typeof createSiteFormSchema>) {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/v1/site/create",
        values,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response) {
        form.reset(); // Reset form after success
        // ✅ Hide popup after 3 seconds
        router.push("/manage-sites");
        //r setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        alert("Something went wrong!");
      }
    } catch (error: any) {
      console.error(
        "Error creating site:",
        error.response?.data || error.message
      );
      alert(
        `Error: ${error.response?.data?.message || "Failed to create site"}`
      );
    }
  }

  return (
    <>
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

      {/* ✅ Show Success Popup when form is submitted successfully */}
      {/* {successMessage && (
        <SuccessPopup
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )} */}
    </>
  );
}
