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
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { api } from "@/trpc/react";
import { toast } from "sonner";

const AdminAccounts = () => {
  const deactivateMutation = api.user.updateUserStatus.useMutation();
  const formSchema = z.object({
    email: z.string().email(),
    deactivate: z.boolean(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      deactivate: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await deactivateMutation.mutateAsync({
        email: values.email,
        deactivate: values.deactivate,
      })
      
      toast.success("User account updated successfully.");
      form.reset();
    } catch (error) {
      console.log(error);
      toast.error("An error occurred. Please try again.");
    }
  }

  return (
    <div className="flex flex-1 px-4 pt-5 flex-col">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Manage accounts</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-10">
        <div className="text-center">
          <h1 className="text-lg font-medium">Manage user accounts.</h1>
          <p className="text-sm opacity-80">
            Activate or deactivate user accounts by providing their email.
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex items-start gap-2 ">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="example@gmail.com" {...field} />
                    </FormControl>
                    <FormDescription>Enter user email address</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deactivate"
                render={({ field }) => (
                  <Select
                    onValueChange={(val) => {
                      field.value = val === "true";
                      form.setValue("deactivate", val === "true");
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Activate" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">Activate</SelectItem>
                      <SelectItem value="true">Deactivate</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <Button type="submit" className="w-full hover:bg-blue">
              Submit
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default AdminAccounts;
