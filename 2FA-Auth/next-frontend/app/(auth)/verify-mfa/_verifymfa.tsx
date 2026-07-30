"use client";
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { ArrowRight, Loader } from "lucide-react";
import Logo from "@/components/logo";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { verifyMFALoginMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const VerifyMfa = () => {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email");

  const { mutate, isPending } = useMutation({
    mutationFn: verifyMFALoginMutationFn,
  });

  const FormSchema = z.object({
    pin: z.string().min(6, {
      message: "Your one-time password must be 6 characters.",
    }),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    if (!email) {
      router.replace("/");
      return;
    }
    const data = {
      code: values.pin,
      email: email,
    };
    mutate(data, {
      onSuccess: (response) => {
        router.replace("/home");
        toast({
          title: "Success",
          description: response?.data?.message,
        });
      },
      onError: (error) => {
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
      <div className="w-full p-5 rounded-md text-gray-900 dark:text-white">

        <h1 className="text-3xl tracking-tight text-gray-900 dark:text-white font-bold mb-2 text-center sm:text-left">
          Multi-Factor Authentication
        </h1>
        <p className="mb-6 text-center sm:text-left text-sm text-gray-500 dark:text-white/60 font-normal">
          Enter the code from your authenticator app.
        </p>

        <div className="mt-2">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full mt-6 flex flex-col gap-4 "
            >
              <FormField
                control={form.control}
                name="pin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm mb-1 font-normal text-gray-700 dark:text-gray-300">
                      One-time code
                    </FormLabel>
                    <FormControl>
                      <InputOTP
                        className="!text-lg flex items-center"
                        maxLength={6}
                        pattern={REGEXP_ONLY_DIGITS}
                        {...field}
                        style={{ justifyContent: "center" }}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot
                            index={0}
                            className="!w-14 !h-12 !text-lg bg-gray-100 dark:bg-white/5 border-gray-300 dark:border-white/20"
                          />
                          <InputOTPSlot
                            index={1}
                            className="!w-14 !h-12 !text-lg bg-gray-100 dark:bg-white/5 border-gray-300 dark:border-white/20"
                          />
                        </InputOTPGroup>
                        <InputOTPGroup>
                          <InputOTPSlot
                            index={2}
                            className="!w-14 !h-12 !text-lg bg-gray-100 dark:bg-white/5 border-gray-300 dark:border-white/20"
                          />
                          <InputOTPSlot
                            index={3}
                            className="!w-14 !h-12 !text-lg bg-gray-100 dark:bg-white/5 border-gray-300 dark:border-white/20"
                          />
                        </InputOTPGroup>
                        <InputOTPGroup>
                          <InputOTPSlot
                            index={4}
                            className="!w-14 !h-12 !text-lg bg-gray-100 dark:bg-white/5 border-gray-300 dark:border-white/20"
                          />
                          <InputOTPSlot
                            index={5}
                            className="!w-14 !h-12 !text-lg bg-gray-100 dark:bg-white/5 border-gray-300 dark:border-white/20"
                          />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button disabled={isPending} className="w-full h-12 mt-2 bg-[#7e57c2] hover:bg-[#6847a3] text-white rounded-lg font-semibold transition-colors">
                {isPending && <Loader className="animate-spin mr-2" />}
                Continue
              </Button>
            </form>
          </Form>
        </div>

        <Button variant="ghost" className="w-full h-12 mt-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors" onClick={() => router.replace("/")}>
          Return to sign in
        </Button>
      </div>
    </main>
  );
};

export default VerifyMfa;
