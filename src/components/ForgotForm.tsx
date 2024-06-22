"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "supabase/supabaseClient";
import { z } from "zod";

const ForgotForm = () => {
  const [debounce, setDebounce] = useState(false);

  const router = useRouter();

  const formSchema = z.object({
    email: z.string().email(),
  });

  type formType = z.infer<typeof formSchema>;

  const form = useForm<formType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  return (
    <div className="flex w-full flex-1 items-center p-10 ">
      <div className="mx-auto flex max-w-screen-2xl flex-col items-center justify-center gap-10 md:flex-row">
        <div className="flex w-full justify-center">
          <Image
            alt="Logo"
            width={1000}
            height={1000}
            src="/logo.webp"
            className="w-44 md:w-[40rem]"
          />
        </div>

        <div className="flex w-full flex-col items-center justify-center text-center">
          <div className="mt-6 w-80 rounded-md border border-black/10 p-4">
            <Form {...form}>
              <h1 className="text-center text-lg font-bold">Password Reset</h1>
              <form
                onSubmit={form.handleSubmit(async (data: formType) => {
                  try {
                    setDebounce(true);
                    await supabase.auth.resetPasswordForEmail(data.email, {
                      redirectTo: `${window.location.origin}/reset-password`,
                    });

                    toast.success(
                      "Password reset link has been sent. Please check your email.",
                    );
                    console.log("Email has been sent!");
                    form.reset();
                    setDebounce(false);
                  } catch (error) {
                    toast.error("Failed sending reset link. Please try again.");
                    setDebounce(false);
                    console.log(error);
                  }
                })}
                className="mt-6 space-y-3"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Email"
                          className=" rounded-lg focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={debounce}
                  className="w-full  rounded-lg  hover:bg-blue"
                >
                  Send Reset Link
                </Button>
                <Link className="pt-2" href={"/auth/signin"}>
                  <Button variant={"link"} className="mt-2">
                    Go back to sign in
                  </Button>
                </Link>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotForm;
