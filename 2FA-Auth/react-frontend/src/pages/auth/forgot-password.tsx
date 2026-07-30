"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import Logo from "@/components/logo";
import { forgotPasswordMutationFn } from "@/lib/api";
import { ArrowRight, Loader, MailCheckIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Link, useSearchParams } from "react-router-dom";

export default function ForgotPassword() {
  const [param] = useSearchParams();
  const email = param.get("email");

  const [isSubmitted, setIsSubmitted] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: forgotPasswordMutationFn,
  });

  const formSchema = z.object({
    email: z.string().trim().email().min(1, {
      message: "Email is required",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: email || "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutate(values, {
      onSuccess: () => {
        setIsSubmitted(true);
      },
      onError: (error) => {
        console.log(error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <main className="w-full">
      {!isSubmitted ? (
        <div className="w-full p-5 rounded-md text-gray-900 dark:text-white">

          <h1 className="text-3xl tracking-tight text-gray-900 dark:text-white font-bold mb-2 text-center sm:text-left">
            Reset password
          </h1>
          <p className="mb-6 text-center sm:text-left text-sm text-gray-500 dark:text-white/60 font-normal">
            Include the email address associated with your account and we’ll
            send you an email with instructions to reset your password.
          </p>
          <Form {...form}>
            <form
              className="flex flex-col gap-6"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <div className="mb-0">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-normal text-gray-700 dark:text-gray-300">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="subscribeto@channel.com"
                          className="bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 h-12 rounded-lg focus-visible:ring-[#7e57c2]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-12 mt-2 bg-[#7e57c2] hover:bg-[#6847a3] text-white rounded-lg font-semibold transition-colors"
              >
                {isPending && <Loader className="animate-spin mr-2" />}
                Send reset instructions
              </Button>
            </form>
          </Form>
        </div>
      ) : (
        <div className="w-full p-5 flex flex-col gap-2 items-center justify-center rounded-md text-gray-900 dark:text-white">
          <div className="size-[48px]">
            <MailCheckIcon size="48px" className="animate-bounce" />
          </div>
          <h2 className="text-3xl tracking-tight text-gray-900 dark:text-white font-bold mb-2">
            Check your email
          </h2>
          <p className="mb-6 text-center text-sm text-gray-500 dark:text-white/60 font-normal">
            We just sent a password reset link to {form.getValues().email}.
          </p>
          <Link to="/">
            <Button className="h-12 bg-[#7e57c2] hover:bg-[#6847a3] text-white rounded-lg font-semibold transition-colors px-6">
              Go to login
              <ArrowRight className="ml-2" />
            </Button>
          </Link>
        </div>
      )}
    </main>
  );
}
