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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "supabase/supabaseClient";
import { z } from "zod";

const AuthForm = () => {
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
          <div className="mt-6 w-80">
            <Tabs defaultValue="signin" className=" flex flex-col">
              <TabsList className="w-full">
                <TabsTrigger className="w-full" value="signin">
                  Sign in
                </TabsTrigger>
                <TabsTrigger className="w-full" value="signup">
                  Sign up
                </TabsTrigger>
              </TabsList>
              <div className="mt-2 rounded-md border p-4">
                <TabsContent value="signin">
                  <Signin />
                </TabsContent>
                <TabsContent value="signup">
                  <Signup />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

const Signin = () => {
  const [debounce, setDebounce] = useState(false);

  const router = useRouter();
  const getUserMutation = api.auth.getUser.useMutation();

  const formSchema = z.object({
    email: z.string().email(),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters." }),
  });

  type formType = z.infer<typeof formSchema>;

  const form = useForm<formType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <Form {...form}>
      <h1 className="text-center text-lg font-bold">Welcome to CTRL+</h1>
      <form
        onSubmit={form.handleSubmit(async (data: formType) => {
          try {
            setDebounce(true);
            const { data: signinData, error } =
              await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
              });

            if (error) {
              form.setError("email", {
                message: "Invalid email or password",
              });
              setDebounce(false);
              return;
            }

            const userData = await getUserMutation.mutateAsync({
              id: signinData.user.id,
            });

            if (userData.deactivated) {
              await supabase.auth.signOut();
              toast.error("Your account has been deactivated.");
              setDebounce(false);
              return;
            }

            await supabase.auth.updateUser({
              data: {
                name: userData.full_name,
                type: userData.user_role,
              },
            });

            router.refresh();
          } catch (error) {
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
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Password"
                  className="rounded-lg  focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                  type="password"
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
          Sign in
        </Button>

        <Button
          variant={"ghost"}
          className="w-full rounded-lg border-black"
          disabled={debounce}
          onClick={() => router.push("/")}
        >
          Continue as Guest
        </Button>
      </form>
    </Form>
  );
};

const Signup = () => {
  const [debounce, setDebounce] = useState(false);

  const router = useRouter();
  const createUserMutation = api.auth.createUser.useMutation();

  const formSchema = z
    .object({
      name: z
        .string()
        .min(3, { message: "Name must be at least 3 characters" })
        .max(35, { message: "Name must not exceed 35 characters." }),
      email: z.string().email(),
      password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters." }),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    });

  type formType = z.infer<typeof formSchema>;

  const form = useForm<formType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  return (
    <Form {...form}>
      <h1 className="text-center text-lg font-bold">Create your account</h1>
      <form
        onSubmit={form.handleSubmit(async (data: formType) => {
          try {
            setDebounce(true);
            const { data: signupData } = await supabase.auth.signUp({
              email: data.email,
              password: data.password,
              options: {
                data: {
                  name: data.name,
                },
              },
            });

            await createUserMutation.mutateAsync({
              id: signupData.user!.id,
              email: data.email,
              full_name: data.name,
            });

            form.reset();
            router.refresh();
            console.log("Signup success");
          } catch (error) {
            setDebounce(false);
            console.log(error);
          }
        })}
        className="mt-6 space-y-3"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Full Name"
                  className=" rounded-lg focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
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
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Password"
                  className="rounded-lg  focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                  type="password"
                  {...field}
                />
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
                <Input
                  placeholder="Confirm Password"
                  className="rounded-lg  focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                  type="password"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full  rounded-lg hover:bg-blue"
          disabled={debounce}
        >
          Sign up
        </Button>
      </form>
    </Form>
  );
};

export default AuthForm;
