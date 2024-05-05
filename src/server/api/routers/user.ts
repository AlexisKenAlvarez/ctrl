import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const userRouter = createTRPCRouter({
  updateRole: publicProcedure
    .input(
      z.object({
        id: z.string(),
        role: z.enum(["user", "testing_center"]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { error } = await ctx.supabase
        .from("users")
        .update({
          user_role: input.role,
        })
        .eq("id", input.id);

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }
    }),
});
