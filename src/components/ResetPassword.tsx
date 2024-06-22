"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { supabase } from "supabase/supabaseClient";
import { toast } from "sonner";
import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const ResetPassword = ({
  accessToken,
  refreshToken,
}: {
  accessToken: string;
  refreshToken: string;
}) => {
  const router = useRouter()
  const formSchema = z
    .object({
      password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters." }),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await supabase.auth.updateUser({
        password: values.password,
      });
      toast.success("Password updated successfully");
      router.replace("/")
    } catch (error) {
      console.log(error);
      toast.error("Failed changing your password. Please try again.");
    }
  }

  useEffect(() => {
    void (async () => {
      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    })();
  }, []);

  return (
    <div className=" flex items-center justify-center min-h-screen  text-center w-full px-5">
      <div className="max-w-sm w-full h-fit ">
        <Image src="/logo.webp" width="500" height="500" alt="Logo" className="w-44 mx-auto" />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 mt-8 w-full">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enter new password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Password" className="max-w-full w-full" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input type="password" placeholder="Confirm Password" className="max-w-full w-full" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full hover:bg-blue/80 bg-blue">Submit</Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ResetPassword;
