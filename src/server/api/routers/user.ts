/* eslint-disable @typescript-eslint/non-nullable-type-assertion-style */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { getFileKey } from "@/lib/utils";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { utapi } from "@/server/uploadthing";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const centerValues = z.object({
  name: z.string().min(1),
  province: z.string().min(1),
  city: z.string().min(1),
  region: z.string().min(1),
  barangay: z.string().min(1),
  zip: z.string().max(4).min(4),
  landmark: z.string().min(1),
  services: z.string().min(5),
  facebook: z.string().url(),
  contact: z.string().min(1).max(11),
  google_map: z.string().nullish(),
});

const imagesObject = z.array(
  z.object({
    id: z.number(),
    created_at: z.string(),
    name: z.string(),
    testing_center: z.number(),
    thumbnail: z.boolean(),
    url: z.string(),
  }),
);

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
  addImage: publicProcedure
    .input(
      z.object({
        testing_center_id: z.number(),
        preview: z.string(),
        url: z.string(),
        thumbnail: z.boolean(),
        name: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { error } = await ctx.supabase.from("images").insert({
        testing_center: input.testing_center_id,
        url: input.url,
        thumbnail: input.thumbnail,
        name: input.name,
      });

      if (error) {
        console.error("Error inserting thumbnail", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }
    }),
  getUser: protectedProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase
        .from("users")
        .select("*")
        .eq("id", input.userId)
        .limit(1)
        .single();

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }

      return data;
    }),
  uploadProfile: publicProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        imageUrl: z.string(),
        imageChanged: z.boolean(),
        oldImage: z.string().nullable(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { error } = await ctx.supabase
        .from("users")
        .update({
          image: input.imageUrl,
        })
        .eq("id", input.userId);

      if (input.imageChanged) {
        const fileKey = getFileKey(input.oldImage!);

        await utapi.deleteFiles(fileKey!);
      }

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }

      return true;
    }),
  updateUserStatus: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        deactivate: z.boolean(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { error } = await ctx.supabase
        .from("users")
        .update({
          deactivated: input.deactivate,
        })
        .eq("email", input.email);

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }

      return true;
    }),
  updateName: protectedProcedure
    .input(
      z.object({
        full_name: z.string(),
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { error } = await ctx.supabase
        .from("users")
        .update({
          full_name: input.full_name,
        })
        .eq("id", input.id);

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }

      return true;
    }),
});
