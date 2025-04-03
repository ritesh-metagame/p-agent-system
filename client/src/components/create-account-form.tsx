// "use client";

// import React from "react";
// import { z } from "zod";
// import { useForm, useFieldArray } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Select,
//   SelectItem,
//   SelectTrigger,
//   SelectContent,
//   SelectValue,
// } from "@/components/ui/select";
// import { Plus } from "lucide-react";

// type Props = {
//   onSubmit?: (values: z.infer<typeof createAccountFormSchema>) => void;
//   roleOptions: string[];
//   categoryOptions: string[];
// };

// // ✅ Schema validation
// const createAccountFormSchema = z.object({
//   firstName: z.string().min(2, { message: "First name is required" }),
//   lastName: z.string().min(2, { message: "Last name is required" }),
//   username: z.string().min(2, { message: "Username is required" }),
//   mobileNumber: z
//     .string()
//     .min(10, { message: "Enter a valid mobile number" })
//     .regex(/^\d+$/, { message: "Must contain only numbers" }),
//   bankName: z.string().min(2, { message: "Bank name is required" }),
//   accountNumber: z
//     .string()
//     .min(5, { message: "Account number must be at least 5 digits" })
//     .regex(/^\d+$/, { message: "Must contain only numbers" }),
//   password: z
//     .string()
//     .min(8, { message: "Password must be at least 8 characters long" }),
//   role: z.string().min(1, { message: "Role is required" }),
//   categorySections: z.array(
//     z.object({
//       category: z.string().min(1, { message: "Category is required" }),
//       commissionPercentage: z
//         .string()
//         .transform((val) => parseFloat(val))
//         .refine((val) => !isNaN(val) && val >= 0 && val <= 100, {
//           message: "Commission must be between 0 and 100",
//         }),
//     })
//   ),
// });

// export default function CreateAccountForm({
//   onSubmit,
//   roleOptions,
//   categoryOptions,
// }: Props) {
//   const form = useForm<z.infer<typeof createAccountFormSchema>>({
//     resolver: zodResolver(createAccountFormSchema),
//     defaultValues: {
//       firstName: "",
//       lastName: "",
//       username: "",
//       mobileNumber: "",
//       bankName: "",
//       accountNumber: "",
//       password: "",
//       role: "",
//       categorySections: [],
//     },
//   });

//   const { fields, append } = useFieldArray({
//     control: form.control,
//     name: "categorySections",
//   });

//   function handleSubmit(values: z.infer<typeof createAccountFormSchema>) {
//     if (onSubmit) {
//       onSubmit(values);
//     }
//     console.log(values);
//   }

//   return (
//     <Card className="w-full max-w-lg mx-auto">
//       <CardHeader>
//         <CardTitle className="text-xl font-bold text-center">
//           Create Account
//         </CardTitle>
//       </CardHeader>
//       <CardContent>
//         <Form {...form}>
//           <form
//             onSubmit={form.handleSubmit(handleSubmit)}
//             className="space-y-4"
//           >
//             {/* First Name */}
//             <FormField
//               control={form.control}
//               name="firstName"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>First Name</FormLabel>
//                   <FormControl>
//                     <Input placeholder="John" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* Last Name */}
//             <FormField
//               control={form.control}
//               name="lastName"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Last Name</FormLabel>
//                   <FormControl>
//                     <Input placeholder="Doe" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* Mobile Number */}
//             <FormField
//               control={form.control}
//               name="mobileNumber"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Mobile Number</FormLabel>
//                   <FormControl>
//                     <Input placeholder="1234567890" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="bankName"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Bank Name</FormLabel>
//                   <FormControl>
//                     <Input placeholder="Doe" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="accountNumber"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Account Number</FormLabel>
//                   <FormControl>
//                     <Input placeholder="Doe" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* Username */}
//             <FormField
//               control={form.control}
//               name="username"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Username</FormLabel>
//                   <FormControl>
//                     <Input placeholder="johndoe" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             {/* Password */}
//             <FormField
//               control={form.control}
//               name="password"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Password</FormLabel>
//                   <FormControl>
//                     <Input type="password" placeholder="********" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* Role Dropdown */}
//             <FormField
//               control={form.control}
//               name="role"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Role</FormLabel>
//                   <Select onValueChange={field.onChange} value={field.value}>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select Role" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {roleOptions.map((role, index) => (
//                         <SelectItem key={index} value={role}>
//                           {role}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* Dynamic Category Sections */}
//             {fields.map((field, index) => (
//               <div
//                 key={field.id}
//                 className="flex items-center gap-4 border p-4 rounded-lg relative"
//               >
//                 {/* Category Dropdown */}
//                 <FormField
//                   control={form.control}
//                   name={`categorySections.${index}.category`}
//                   render={({ field }) => (
//                     <FormItem className="flex-1">
//                       <FormLabel>Category</FormLabel>
//                       <Select
//                         onValueChange={field.onChange}
//                         value={field.value}
//                       >
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select Category" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           {categoryOptions.map((category, i) => (
//                             <SelectItem key={i} value={category}>
//                               {category}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 {/* Commission Percentage Field */}
//                 <FormField
//                   control={form.control}
//                   name={`categorySections.${index}.commissionPercentage`}
//                   render={({ field }) => (
//                     <FormItem className="flex-1">
//                       <FormLabel>Commission (%)</FormLabel>
//                       <FormControl>
//                         <Input type="number" placeholder="0 - 100" {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 {/* Add More Sections Button */}
//                 {index === fields.length - 1 && (
//                   <Button
//                     variant="outline"
//                     size="icon"
//                     className="absolute right-[-40px] top-1/2 transform -translate-y-1/2"
//                     onClick={() =>
//                       append({ category: "", commissionPercentage: "" })
//                     }
//                     type="button"
//                   >
//                     <Plus size={20} />
//                   </Button>
//                 )}
//               </div>
//             ))}

//             {/* Initial Add Button */}
//             {fields.length === 0 && (
//               <Button
//                 variant="outline"
//                 onClick={() =>
//                   append({ category: "", commissionPercentage: "" })
//                 }
//                 type="button"
//                 className="w-full"
//               >
//                 <Plus size={20} className="mr-2" />
//                 Add Category Section
//               </Button>
//             )}

//             {/* Submit Button */}
//             <Button
//               variant="default"
//               type="submit"
//               className="w-full color-orange"
//             >
//               Submit
//             </Button>
//           </form>
//         </Form>
//       </CardContent>
//     </Card>
//   );
// }

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

// ✅ Schema validation
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
  role: z.string().min(1, { message: "Role is required" }),
  categorySections: z.array(
    z.object({
      category: z.string().min(1, { message: "Category is required" }),
      commissionPercentage: z
        .string()
        .transform((val) => parseFloat(val))
        .refine((val) => !isNaN(val) && val >= 0 && val <= 100, {
          message: "Commission must be between 0 and 100",
        }),
    })
  ),
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
      role: "",
      categorySections: [],
    },
  });

  const { fields, append } = useFieldArray({
    control: form.control,
    name: "categorySections",
  });

  function handleSubmit(values: z.infer<typeof createAccountFormSchema>) {
    if (onSubmit) {
      onSubmit(values);
    }
    console.log(values);
  }

  // Extract selected categories
  const selectedCategories = form
    .watch("categorySections")
    .map((c) => c.category);

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

            <FormField
              control={form.control}
              name="bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
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
                  <FormLabel>Account Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
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
            <FormField
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
            />

            {/* Dynamic Category Sections */}
            {fields.map((field, index) => {
              const availableCategories = categoryOptions.filter(
                (category) =>
                  !selectedCategories.includes(category) ||
                  selectedCategories[index] === category
              );

              return (
                <div
                  key={field.id}
                  className="flex items-center gap-4 border p-4 rounded-lg relative"
                >
                  {/* Category Dropdown */}
                  <FormField
                    control={form.control}
                    name={`categorySections.${index}.category`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableCategories.map((category, i) => (
                              <SelectItem key={i} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Commission Percentage Field */}
                  <FormField
                    control={form.control}
                    name={`categorySections.${index}.commissionPercentage`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Commission (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0 - 100"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Add More Sections Button */}
                  {/* {index === fields.length - 1 &&
                    availableCategories.length > 0 && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute right-[-40px] top-1/2 transform -translate-y-1/2"
                        onClick={() =>
                          append({ category: "", commissionPercentage: "" })
                        }
                        type="button"
                      >
                        <Plus size={20} />
                      </Button>
                    )} */}

                  {index === fields.length - 1 &&
                    availableCategories.length > 0 &&
                    fields.length < 3 && ( // <-- This ensures only 3 sections max
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute right-[-40px] top-1/2 transform -translate-y-1/2"
                        onClick={() =>
                          append({ category: "", commissionPercentage: "" })
                        }
                        type="button"
                      >
                        <Plus size={20} />
                      </Button>
                    )}
                </div>
              );
            })}

            {/* Initial Add Button */}
            {/* {fields.length === 0 && (
              <Button
                variant="outline"
                onClick={() =>
                  append({ category: "", commissionPercentage: "" })
                }
                type="button"
                className="w-full"
              >
                <Plus size={20} className="mr-2" />
                Add Category Section
              </Button>
            )} */}

            {fields.length === 0 &&
              fields.length < 3 && ( // <-- This ensures only 3 sections max
                <Button
                  variant="outline"
                  onClick={() =>
                    append({ category: "", commissionPercentage: "" })
                  }
                  type="button"
                  className="w-full"
                  style={{
                    backgroundColor: "#f97316",
                    color: "white",
                    borderColor: "#f97316",
                  }}
                >
                  <Plus size={20} className="mr-2" />
                  Add Category Section
                </Button>
              )}

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
