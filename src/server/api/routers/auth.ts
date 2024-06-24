import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const authRouter = createTRPCRouter({
  getSession: publicProcedure.query(async ({ ctx }) => {
    const user = ctx.user;
    return { user };
  }),
  getUserFromSession: publicProcedure.query(async ({ ctx }) => {
    const user = ctx.user;

    if (!user) {
      return
    }

    const { data, error } = await ctx.supabase
      .from("users")
      .select("*")
      .eq("id", user?.id ?? "")
      .single();

    if (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      });
    }

    return data;
  }),

  getUser: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase
        .from("users")
        .select("*")
        .eq("id", input.id)
        .single();

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }

      return data;
    }),
  createUser: publicProcedure
    .input(
      z.object({
        id: z.string(),
        email: z.string().email(),
        full_name: z.string().min(3).max(100),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      console.log("Inside mutation");
      const { error } = await ctx.supabase.from("users").insert({
        id: input.id,
        email: input.email,
        full_name: input.full_name,
      });

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }
    }),
});
