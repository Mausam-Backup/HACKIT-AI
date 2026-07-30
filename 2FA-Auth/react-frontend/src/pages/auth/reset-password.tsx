"use client";
import { z } from "zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
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
import { resetPasswordMutationFn } from "@/lib/api";
import { ArrowLeft, Frown, Loader } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [params] = useSearchParams();
  const code = params.get("code");
  const exp = Number(params.get("exp"));
  const now = Date.now();

  const isValid = code && exp && exp > now;

  const { mutate, isPending } = useMutation({
    mutationFn: resetPasswordMutationFn,
  });

  const formSchema = z
    .object({
      password: z.string().trim().min(1, {
        message: "Password is required",
      }),
      confirmPassword: z.string().trim().min(1, {
        message: "Confirm password is required",
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Password does not match",
      path: ["confirmPassword"],
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!code) {
      navigate("/forgot-password?email=");
      return;
    }
    const data = {
      password: values.password,
      verificationCode: code,
    };
    mutate(data, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Password reset successfully",
        });
        navigate("/");
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
      <>
        {isValid ? (
          <div className="w-full p-5 rounded-md text-gray-900 dark:text-white">
            <h1 className="text-3xl tracking-tight text-gray-900 dark:text-white font-bold mb-2 text-center sm:text-left">
              Set up a new password
            </h1>
            <p className="mb-6 text-center sm:text-left text-sm text-gray-500 dark:text-white/60 font-normal">
              Your password must be different from your previous one.
            </p>
            <Form {...form}>
              <form
                className="flex flex-col gap-6"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <div className="mb-0">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-normal text-gray-700 dark:text-gray-300">
                          New password
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            autoComplete="off"
                            placeholder="Enter your password"
                            className="bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 h-12 rounded-lg focus-visible:ring-[#7e57c2]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="mb-0">
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-normal text-gray-700 dark:text-gray-300">
                          Confirm new password
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            autoComplete="off"
                            placeholder="Enter your password again"
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
                  disabled={isPending}
                  className="w-full h-12 mt-2 bg-[#7e57c2] hover:bg-[#6847a3] text-white rounded-lg font-semibold transition-colors"
                >
                  {isPending && <Loader className="animate-spin mr-2" />}
                  Reset password
                </Button>
              </form>
            </Form>
          </div>
        ) : (
          <div className="w-full p-5 flex flex-col gap-2 items-center justify-center rounded-md text-gray-900 dark:text-white">
            <div className="size-[48px]">
              <Frown size="48px" className="animate-bounce text-red-500" />
            </div>
            <h2 className="text-3xl tracking-tight text-gray-900 dark:text-white font-bold mb-2">
              Invalid or expired reset link
            </h2>
            <p className="mb-6 text-center text-sm text-gray-500 dark:text-white/60 font-normal">
              You can request a new password reset link
            </p>
            <Link to="/forgot-password?email=">
              <Button className="h-12 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-900 dark:text-white rounded-lg font-semibold transition-colors px-6">
                <ArrowLeft className="mr-2" />
                Go to forgot password
              </Button>
            </Link>
          </div>
        )}
      </>
    </main>
  );
}
