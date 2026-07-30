"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowRight, Loader } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import Link from "next/link";
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
import { loginMutationFn } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

export default function Login() {
  const router = useRouter();
  const { mutate, isPending } = useMutation({
    mutationFn: loginMutationFn,
  });

  const formSchema = z.object({
    email: z.string().trim().email().min(1, {
      message: "Email is required",
    }),
    password: z.string().trim().min(1, {
      message: "Password is required",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutate(values, {
      onSuccess: (response) => {
        if (response.data.mfaRequired) {
          router.replace(`/verify-mfa?email=${values.email}`);
          return;
        }
        router.replace(`/home`);
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
          Log in
        </h1>
        <p className="mb-8 text-center sm:text-left text-sm text-gray-500 dark:text-white/60 font-normal">
          Don't have an account?{" "}
          <Link className="text-[#7e57c2] hover:underline" href="/signup">
            Sign up
          </Link>
        </p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="mb-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        placeholder="Email" 
                        className="bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 h-12 rounded-lg focus-visible:ring-[#7e57c2]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 dark:text-red-400" />
                  </FormItem>
                )}
              />
            </div>
            <div className="mb-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        className="bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 h-12 rounded-lg focus-visible:ring-[#7e57c2]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 dark:text-red-400" />
                  </FormItem>
                )}
              />
            </div>
            <div className="mb-6 flex w-full items-center justify-end">
              <Link
                className="text-sm text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition-colors"
                href={`/forgot-password?email=${form.getValues().email}`}
              >
                Forgot your password?
              </Link>
            </div>
            <Button
              disabled={isPending}
              className="w-full text-[15px] h-12 bg-[#7e57c2] hover:bg-[#6847a3] text-white rounded-lg font-semibold transition-colors"
              type="submit"
            >
              {isPending && <Loader className="animate-spin mr-2" />}
              Log in
            </Button>

            <div className="my-8 flex items-center justify-center">
              <div className="h-px w-full bg-gray-200 dark:bg-white/10" />
              <span className="mx-4 text-xs text-gray-400 dark:text-white/40 font-normal whitespace-nowrap">
                Or register with
              </span>
              <div className="h-px w-full bg-gray-200 dark:bg-white/10" />
            </div>
          </form>
        </Form>
        <div className="flex gap-4 w-full">
          <Button variant="outline" type="button" className="w-1/2 h-12 bg-transparent border-gray-300 dark:border-white/20 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white rounded-lg">
            Google
          </Button>
          <Button variant="outline" type="button" className="w-1/2 h-12 bg-transparent border-gray-300 dark:border-white/20 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white rounded-lg">
            Apple
          </Button>
        </div>
        <p className="text-xs text-gray-400 dark:text-white/40 font-normal mt-8 text-center sm:text-left">
          By signing in, you agree to our{" "}
          <a className="text-[#7e57c2] hover:underline" href="#">
            Terms & Conditions
          </a>
        </p>
      </div>
    </main>
  );
}
