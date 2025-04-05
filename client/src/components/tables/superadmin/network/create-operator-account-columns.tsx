// "use client";

// import { useEffect, useState, useCallback } from 'react';
// import { useDebounceValue } from 'usehooks-ts';
// import * as z from 'zod';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import axios, { AxiosError } from 'axios';
// import { Button } from '@/components/ui/button';
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from '@/components/ui/form';
// import { Input } from '@/components/ui/input';
// //
// const formSchema = z.object({
//   lastName: z.string()
//     .min(2, { message: "Last name must be at least 2 characters" })
//     .max(50, { message: "Last name cannot exceed 50 characters" })
//     .trim(),
//   firstName: z.string()
//     .min(2, { message: "First name must be at least 2 characters" })
//     .max(50, { message: "First name cannot exceed 50 characters" })
//     .trim(),
//   mobileNumber: z.string()
//     .regex(/^[6-9]\d{9}$/, {
//       message: "Invalid Indian mobile number format"
//     }),
//   bankNameForSettlement: z.string()
//     .min(3, { message: "Bank name must be at least 3 characters" })
//     .max(100, { message: "Bank name cannot exceed 100 characters" })
//     .trim(),
//   bankAccountNumberForSettlement: z.string()
//     .regex(/^\d+$/, { message: "Bank account number must contain only digits" })
//     .min(8, { message: "Bank account number must be at least 8 digits" })
//     .max(20, { message: "Bank account number cannot exceed 20 digits" }),
// });

// interface OperatorFormData extends z.infer<typeof formSchema> {}

// const CreateOperatorAccountForm = () => {
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [mobileStatus, setMobileStatus] = useState<{
//     message: string;
//     isValid: boolean;
//   }>({ message: '', isValid: false });
//   const [submissionError, setSubmissionError] = useState('');
//   const [successMessage, setSuccessMessage] = useState('');

//   const form = useForm<OperatorFormData>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       lastName: '',
//       firstName: '',
//       mobileNumber: '',
//       bankNameForSettlement: '',
//       bankAccountNumberForSettlement: '',
//     },
//     mode: 'onBlur',
//   });

//   const mobileNumber = form.watch('mobileNumber');
//   const [debouncedMobileNumber] = useDebounceValue(mobileNumber, 500);

//   const checkMobileUnique = useCallback(async (mobile: string) => {
//     try {
//       const isValidMobile = await form.trigger('mobileNumber');
//       if (!isValidMobile) {
//         setMobileStatus({ message: 'Invalid mobile format', isValid: false });
//         return;
//       }
// //TODO: fix the route this is a dummy rouye
//       const { data } = await axios.get('/api/check-mobileNumber-unique', {
//         params: { mobileNumber: mobile },
//       });
//       setMobileStatus({ message: data.message, isValid: data.isAvailable });
//     } catch (error) {
//       const message = error instanceof AxiosError
//         ? error.response?.data?.message || 'Error checking mobile number'
//         : 'An unexpected error occurred';
//       setMobileStatus({ message, isValid: false });
//     }
//   }, [form]);

//   useEffect(() => {
//     const controller = new AbortController();

//     if (debouncedMobileNumber.length === 10) {
//       checkMobileUnique(debouncedMobileNumber);
//     }

//     return () => controller.abort();
//   }, [debouncedMobileNumber, checkMobileUnique]);

//   const onSubmit = async (data: OperatorFormData) => {
//     setIsSubmitting(true);
//     setSubmissionError('');
//     setSuccessMessage('');
// //TODO: adjust the route
//     try {
//       const response = await axios.post('/api/operators', {
//         ...data,
//         mobileNumber: data.mobileNumber.trim(),
//       });

//       if (response.status === 201) {
//         setSuccessMessage('Operator account created successfully!');
//         form.reset();
//       }
//     } catch (error) {
//       let errorMessage = 'Failed to create operator account';
//       if (error instanceof AxiosError) {
//         errorMessage = error.response?.data?.error || errorMessage;
//       }
//       setSubmissionError(errorMessage);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
//       <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-8">
//         <h1 className="text-3xl font-bold text-center mb-8">
//           Create Operator Account
//         </h1>

//         <Form {...form}>
//           <form
//             onSubmit={form.handleSubmit(onSubmit)}
//             className="space-y-6"
//             aria-labelledby="formTitle"
//           >
//             {/* Last Name Field */}
//             <FormField
//               control={form.control}
//               name="lastName"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Last Name</FormLabel>
//                   <FormControl>
//                     <Input
//                       {...field}
//                       placeholder="Enter last name"
//                       maxLength={50}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* First Name Field */}
//             <FormField
//               control={form.control}
//               name="firstName"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>First Name</FormLabel>
//                   <FormControl>
//                     <Input
//                       {...field}
//                       placeholder="Enter first name"
//                       maxLength={50}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* Mobile Number Field */}
//             <FormField
//               control={form.control}
//               name="mobileNumber"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Mobile Number</FormLabel>
//                   <FormControl>
//                     <Input
//                       {...field}
//                       placeholder="Enter 10-digit mobile number"
//                       maxLength={10}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                   {mobileStatus.message && (
//                     <div className={`text-sm ${
//                       mobileStatus.isValid ? 'text-green-600' : 'text-red-500'
//                     }`}>
//                       {mobileStatus.message}
//                     </div>
//                   )}
//                 </FormItem>
//               )}
//             />

//             {/* Bank Name Field */}
//             <FormField
//               control={form.control}
//               name="bankNameForSettlement"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Bank Name</FormLabel>
//                   <FormControl>
//                     <Input
//                       {...field}
//                       placeholder="Enter bank name"
//                       maxLength={100}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* Bank Account Number Field */}
//             <FormField
//               control={form.control}
//               name="bankAccountNumberForSettlement"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Bank Account Number</FormLabel>
//                   <FormControl>
//                     <Input
//                       {...field}
//                       placeholder="Enter account number"
//                       maxLength={20}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* Submission Feedback */}
//             {successMessage && (
//               <div className="text-green-600 text-center">
//                 {successMessage}
//               </div>
//             )}
//             {submissionError && (
//               <div className="text-red-500 text-center">
//                 {submissionError}
//               </div>
//             )}

//             {/* Submit Button */}
//             <Button
//               type="submit"
//               className="w-full"
//               disabled={
//                 isSubmitting ||
//                 !form.formState.isValid ||
//                 !mobileStatus.isValid
//               }
//               aria-label="Submit operator account form"
//             >
//               {isSubmitting ? 'Creating Account...' : 'Create Account'}
//             </Button>
//           </form>
//         </Form>
//       </div>
//     </div>
//   );
// };

// export default CreateOperatorAccountForm;
