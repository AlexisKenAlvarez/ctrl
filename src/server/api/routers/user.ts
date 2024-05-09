/* eslint-disable @typescript-eslint/no-misused-promises */
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
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
        ownerId: z.string(),
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
          owner: input.ownerId,
          status: "pending",
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
  getCenters: protectedProcedure
    .input(
      z.object({
        status: z.enum(["all", "pending", "accepted", "rejected"]),
        owner: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (input.status === "all") {
        const { data, error } = await ctx.supabase
          .from("testing_centers")
          .select(
            "*, location:locations(*), open_hour:open_hours(*), images(*)",
          )
          .eq("owner", input.owner);

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message,
          });
        }

        return data;
      }
      const { data, error } = await ctx.supabase
        .from("testing_centers")
        .select("*, location:locations(*), open_hour:open_hours(*), images(*)")
        .eq("status", input.status);

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }

      return data;
    }),
  getSingleCenter: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase
        .from("testing_centers")
        .select("*, location:locations(*), open_hour:open_hours(*), images(*)")
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
  updateCenter: protectedProcedure
    .input(
      z.object({
        thumbnailChanged: z.boolean(),
        centerId: z.string(),
        old_open_hours: z.array(
          z.object({
            label: z.string().min(1),
            checked: z.boolean(),
            open: z.string().nullable(),
            close: z.string().nullable(),
          }),
        ),
        oldValues: centerValues,
        old_thumbnail: z.string(),
        newValues: centerValues,
        new_open_hours: z.array(
          z.object({
            label: z.string().min(1),
            checked: z.boolean(),
            open: z.string().nullable(),
            close: z.string().nullable(),
          }),
        ),
        new_thumbnail: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (input.newValues.name !== input.oldValues.name) {
          await ctx.supabase
            .from("testing_centers")
            .update({
              name: input.newValues.name,
            })
            .eq("id", input.centerId);
        }

        if (input.newValues.province !== input.oldValues.province) {
          await ctx.supabase
            .from("locations")
            .update({
              province: input.newValues.province,
            })
            .eq("testing_center", input.centerId);
        }

        if (input.newValues.city !== input.oldValues.city) {
          await ctx.supabase
            .from("locations")
            .update({
              city: input.newValues.city,
            })
            .eq("testing_center", input.centerId);
        }

        if (input.newValues.region !== input.oldValues.region) {
          await ctx.supabase
            .from("locations")
            .update({
              region: input.newValues.region,
            })
            .eq("testing_center", input.centerId);
        }

        if (input.newValues.barangay !== input.oldValues.barangay) {
          await ctx.supabase
            .from("locations")
            .update({
              barangay: input.newValues.barangay,
            })
            .eq("testing_center", input.centerId);
        }

        if (input.newValues.zip !== input.oldValues.zip) {
          await ctx.supabase
            .from("locations")
            .update({
              zip: parseInt(input.newValues.zip),
            })
            .eq("testing_center", input.centerId);
        }

        if (input.newValues.landmark !== input.oldValues.landmark) {
          await ctx.supabase
            .from("locations")
            .update({
              landmark: input.newValues.landmark,
            })
            .eq("testing_center", input.centerId);
        }

        if (input.newValues.services !== input.oldValues.services) {
          await ctx.supabase
            .from("testing_centers")
            .update({
              services: input.newValues.services,
            })
            .eq("id", input.centerId);
        }

        if (input.newValues.facebook !== input.oldValues.facebook) {
          await ctx.supabase
            .from("testing_centers")
            .update({
              facebook: input.newValues.facebook,
            })
            .eq("id", input.centerId);
        }

        if (input.newValues.contact !== input.oldValues.contact) {
          await ctx.supabase
            .from("testing_centers")
            .update({
              contact: parseInt(input.newValues.contact),
            })
            .eq("id", input.centerId);
        }

        if (input.newValues.google_map !== input.oldValues.google_map) {
          await ctx.supabase
            .from("testing_centers")
            .update({
              google_map: input.newValues.google_map,
            })
            .eq("id", input.centerId);
        }

        if (
          input.new_thumbnail !== input.old_thumbnail &&
          input.thumbnailChanged
        ) {
          await ctx.supabase
            .from("images")
            .update({
              thumbnail: true,
            })
            .eq("testing_center", input.centerId);
        }

        input.new_open_hours.forEach(async (hour, index) => {
          if (hour.open !== input.old_open_hours[index]?.open) {
            await ctx.supabase
              .from("open_hours")
              .update({
                open_time: hour.open,
                close_time: hour.close,
              })
              .eq("testing_center", input.centerId)
              .eq("day", hour.label);
          }
        });

      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error updating center",
        });
      }
    }),
});
