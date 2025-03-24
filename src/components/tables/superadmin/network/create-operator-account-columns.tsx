"use client";


import { useEffect, useState} from 'react';
import {useDebounceValue} from 'usehooks-ts'


import * as z from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import Link from 'next/link';
import axios, { AxiosError } from 'axios';
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"



// const formSchema = z.object({
//     lastName: z.string().min(3, { message: "Last name must be at least 2 characters"}),
//     firstName: z.string().min(3, { message: "First name must be at least"}),
//     mobileNumber: z.string().min(10, { message: "Mobile number must be at least 10 characters"}).max(10),
//     bankNameForSettlement: z.string().min(3, { message: "Bank name must be at least 3 characters"}),
//     bankAccountNumberForSettlement: z.string().min(10, { message: "Bank"}),
// })

const formSchema = z.object({
    lastName: z.string()
      .min(2, { message: "Last name must be at least 2 characters" })
      .max(50, { message: "Last name cannot exceed 50 characters" })
      .trim(), 
    firstName: z.string()
      .min(2, { message: "First name must be at least 2 characters" })
      .max(50, { message: "First name cannot exceed 50 characters" })
      .trim(),
    mobileNumber: z.string()
      .regex(/^\d{10}$/, { message: "Mobile number must be exactly 10 digits" }), 
    bankNameForSettlement: z.string()
      .min(3, { message: "Bank name must be at least 3 characters" })
      .max(100, { message: "Bank name cannot exceed 100 characters" })
      .trim(),
    bankAccountNumberForSettlement: z.string()
      .regex(/^\d+$/, { message: "Bank account number must contain only digits" })
      .min(8, {message: "Bank account number must be at least 8 digits"})
      .max(20, {message: "Bank account number cannot exceed 20 digits"}),
  });




const createOperatorAccountForm =() => {

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [bankNameForSettlement, setBankNameForSettlement] = useState('');
    const [bankAccountNumberForSettlement, setBankAccountNumberForSettlement] = useState('');

    /// used debouncing so that we can check if the mobile number is unique or not in a regular interval of 500ms

    const debouncedUserMobileNumber = useDebounceValue(mobileNumber,500);
    //zod implementation
    const form = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema),
        defaultValues: {
            lastName: '',
            firstName: '',
            mobileNumber: '',
            bankNameForSettlement: '',
            bankAccountNumberForSettlement: '',

        }
     });

     ///below few lines of code are used to check if the mobile number is unique or not by a simple get requst [NB: optional]
     const [isMobileNumberUnique, setIsMobileNumberUnique] = useState(false);
     const [isMobileNumberUniqueLoading, setIsMobileNumberUniqueLoading] = useState(false);
     const [isSubmitting, setIsSubmitting] = useState(false);
     const [isMobileNumberUniqueError, setIsMobileNumberUniqueError] = useState(false);
     const [isMobileNumberUniqueSuccess, setIsMobileNumberUniqueSuccess] = useState(false);
     const [isMobileNumberUniqueMessage, setIsMobileNumberUniqueMessage] = useState('');
     const [isMobileNumberUniqueData, setIsMobileNumberUniqueData] = useState({});
     const [isMobileNumberUniqueDataLoading, setIsMobileNumberUniqueDataLoading] = useState(false)
     const [isMobileNumberUniqueDataError, setIsMobileNumberUniqueDataError] = useState(false)
     const [isMobileNumberUniqueDataSuccess, setIsMobileNumberUniqueDataSuccess] = useState(false)
     const [isMobileNumberUniqueDataMessage, setIsMobileNumberUniqueDataMessage] = useState('');

     useEffect(() => {
       const checkMobileNumberUnique = async () => {
        if(debouncedUserMobileNumber){
            setIsMobileNumberUnique(true);
            setIsMobileNumberUniqueMessage('');// need to get this fromt he backend in response 
            try {
               const response=  await axios.get(`/api/check-mobileNumber-unique?mobileNumber=${debouncedUserMobileNumber}`)
                setIsMobileNumberUniqueMessage(response.data.message)
            } catch (error) {
                if (axios.isAxiosError(error) && error.response) {
                    setIsMobileNumberUniqueMessage(error.response.data?.message ?? 'Error checking mobile number uniqueness');
                } else {
                    setIsMobileNumberUniqueMessage('An unexpected error occurred');
                }
            } finally{
                setIsMobileNumberUnique(false);
            }

            
        }
       }
     
      checkMobileNumberUnique();
     }, [debouncedUserMobileNumber])
     
     ///online check                               
     const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);
        try {
            const response = await axios.post('/api/submit-form', data);
            setIsSubmitting(false);
            setIsMobileNumberUniqueSuccess(true);
            setIsMobileNumberUniqueMessage(response.data.message);
            setIsMobileNumberUniqueData(response.data.data);
            setIsMobileNumberUniqueDataLoading(false);
            setIsMobileNumberUniqueDataError(false);
            setIsMobileNumberUniqueDataSuccess(true);
            setIsMobileNumberUniqueDataMessage(response.data.message);
            console.log(`The Response object is :${response}`)

        } catch (error) {
            console.error("Error submitting form:", error);
            setIsSubmitting(false);
          
        let errorMessage = 'An unexpected error occurred';

        if (axios.isAxiosError(error) && error.response) {
            errorMessage = error.response.data?.message ?? errorMessage;
        }

        setIsMobileNumberUniqueMessage(errorMessage);
        setIsSubmitting(false);


        }
     }

  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-100'>
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
            <div className="text-center">
                <h1 className="text-4xl font-extrabold tracking-light lg:text-5xl mb-6">
                    Please fill up the form to create Operator Account. 
                </h1>
                <p className="mb-4">Create operator account</p>
            </div>

            {/* Now building the form */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>

                    {/* now will add the form fields */}

                    <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                            <Input placeholder="LAst Name" {...field}
                                onChange={(e)=>{
                                field.onChange(e)
                                setLastName(e.target.value)
                                        }}
                                        />
                            </FormControl>
              
                            <FormMessage />
                        </FormItem>
                     )}
                    />

                    {/* below another */}
                    <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                            <Input placeholder="LAst Name" {...field}
                                onChange={(e)=>{
                                field.onChange(e)
                                setLastName(e.target.value)
                                        }}
                                        />
                            </FormControl>
              
                            <FormMessage />
                        </FormItem>
                     )}
                    />
                    {/* below another */}
                    <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                            <Input placeholder="LAst Name" {...field}
                                onChange={(e)=>{
                                field.onChange(e)
                                setLastName(e.target.value)
                                        }}
                                        />
                            </FormControl>
              
                            <FormMessage />
                        </FormItem>
                     )}
                    />
                    {/* below another */}
                    <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                            <Input placeholder="LAst Name" {...field}
                                onChange={(e)=>{
                                field.onChange(e)
                                setLastName(e.target.value)
                                        }}
                                        />
                            </FormControl>
              
                            <FormMessage />
                        </FormItem>
                     )}
                    />
                    {/* below another */}
                    <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                            <Input placeholder="LAst Name" {...field}
                                onChange={(e)=>{
                                field.onChange(e)
                                setLastName(e.target.value)
                                        }}
                                        />
                            </FormControl>
              
                            <FormMessage />
                        </FormItem>
                     )}
                    />

                    <Button type='submit' disabled={isSubmitting} >Submit/Add</Button>
                </form>
            </Form>

        </div>
    </div>
  )
}

export default createOperatorAccountForm;

