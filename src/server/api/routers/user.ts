import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { parse } from "path";
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
  addTestingCenter: protectedProcedure
    .input(
      z.object({
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
        open_hours: z.array(
          z.object({
            label: z.string().min(1),
            checked: z.boolean(),
            open: z.string().nullish(),
            close: z.string().nullish(),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { data: centerData, error: centerError } = await ctx.supabase
        .from("testing_centers")
        .insert({
          name: input.name,
          services: input.services,
          facebook: input.facebook,
          contact: parseInt(input.contact),
          google_map: input.google_map,
        })
        .select("id")
        .single();

      if (centerError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: centerError.message,
        });
      }

      const { error: locationError } = await ctx.supabase
        .from("locations")
        .insert({
          testing_center: centerData.id,
          region: input.region,
          province: input.province,
          city: input.city,
          barangay: input.barangay,
          zip: parseInt(input.zip),
          landmark: input.landmark,
        });

      if (locationError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: locationError.message,
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      input.open_hours.forEach(async (hour) => {
        type days =
          | "monday"
          | "tuesday"
          | "wednesday"
          | "thursday"
          | "friday"
          | "saturday"
          | "sunday";

        const { error: hoursError } = await ctx.supabase
          .from("open_hours")
          .insert({
            testing_center: centerData.id,
            open_time: hour.open,
            close_time: hour.close,
            day: hour.label as days,
          });

        if (hoursError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: hoursError.message,
          });
        }
      });

      return centerData;
    }),
  addImage: publicProcedure
    .input(
      z.object({
        testing_center_id: z.number(),
        preview: z.string(),
        url: z.string(),
        thumbnail: z.boolean()
      }),
    )
    .query(async ({ input, ctx }) => {
      const { error } = await ctx.supabase.from("images").insert({
        testing_center: input.testing_center_id,
        url: input.url,
        thumbnail: input.thumbnail,
      });

      if (error) {
        console.error("Error inserting thumbnail", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }
    }),
});
