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

export const labRouter = createTRPCRouter({
  deleteReviews: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { error } = await ctx.supabase.from("reviews").delete().eq("id", input.id)

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }

      return true
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
  getCenters: protectedProcedure
    .input(
      z.object({
        status: z.enum(["all", "pending", "accepted", "rejected"]),
        owner: z.string().nullable(),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (input.status === "all" && !input.owner) {
        const { data, error } = await ctx.supabase
          .from("testing_centers")
          .select(
            "*, location:locations(*), open_hour:open_hours(*), images(*), owner_data:users(*)",
          )
          .order("created_at", { ascending: false });

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message,
          });
        }

        return data;
      }

      if (input.status === "all" && input.owner) {
        const { data, error } = await ctx.supabase
          .from("testing_centers")
          .select(
            "*, location:locations(*), open_hour:open_hours(*), images(*), owner_data:users(*)",
          )
          .eq("owner", input.owner)
          .order("created_at", { ascending: false });

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
        .select(
          "*, location:locations(*), open_hour:open_hours(*), images(*), owner_data:users(*)",
        )
        .eq("status", input.status);

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }

      return data;
    }),
  getHeroCenters: publicProcedure
    .input(
      z.object({
        status: z.enum(["all", "pending", "accepted", "rejected"]),
        search: z.string().nullable(),
        filter: z.enum(["top-rated", "oldest", "newest"]).nullable(),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (input.search) {
        const { data, error } = await ctx.supabase
          .rpc("search_location", {
            keyword: input.search,
          })
          .select(
            "*, location:locations(*), open_hour:open_hours(*), images(*)",
          )
          .order("created_at", { ascending: false });

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message,
          });
        }

        return data;
      } else {
        if (input.filter === "top-rated") {
          const { data, error } = await ctx.supabase
            .from("testing_centers_with_review_counts")
            .select(
              "*, location:locations(*), open_hour:open_hours(*), images(*)",
            )
            .eq("status", input.status)
            .order("review_count", { ascending: false });

          if (error) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: error.message,
            });
          }

          return data;
        } else if (input.filter === "newest") {
          const { data, error } = await ctx.supabase
            .from("testing_centers")
            .select(
              "*, location:locations(*), open_hour:open_hours(*), images(*)",
            )
            .eq("status", input.status)
            .eq("deactivated", false)
            .order("created_at", { ascending: false });

          if (error) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: error.message,
            });
          }

          return data;
        } else if (input.filter === "oldest") {
          const { data, error } = await ctx.supabase
            .from("testing_centers")
            .select(
              "*, location:locations(*), open_hour:open_hours(*), images(*)",
            )
            .eq("status", input.status)
            .eq("deactivated", false)

            .order("created_at", { ascending: true });

          if (error) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: error.message,
            });
          }

          return data;
        } else {
          const { data, error } = await ctx.supabase
            .from("testing_centers")
            .select(
              "*, location:locations(*), open_hour:open_hours(*), images(*)",
            )
            .eq("status", input.status)
            .eq("deactivated", false)

            .order("created_at", { ascending: false });

          if (error) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: error.message,
            });
          }

          return data;
        }
      }
    }),
  getSingleCenter: publicProcedure
    .input(
      z.object({
        id: z.string(),
        type: z.enum(["pending", "accepted", "rejected", "deleted"]).nullish(),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (input.type) {
        const { data, error } = await ctx.supabase
          .from("testing_centers")
          .select(
            "*, owner_data:users(*), location:locations(*), open_hour:open_hours(*), images(*)",
          )
          .eq("id", input.id)
          .eq("status", input.type)
          .single();

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message,
          });
        }

        return data;
      } else {
        const { data, error } = await ctx.supabase
          .from("testing_centers")
          .select(
            "*, owner_data:users(*), location:locations(*), open_hour:open_hours(*), images(*)",
          )
          .eq("id", input.id)
          .single();

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message,
          });
        }

        return data;
      }
    }),
  getReviews: publicProcedure
    .input(z.object({ labId: z.number() }))
    .query(async ({ input, ctx }) => {
      const { data: rating } = await ctx.supabase
        .rpc("getaverage", {
          labid: input.labId,
        })
        .limit(1)
        .single();

      const { data, error } = await ctx.supabase
        .from("reviews")
        .select("*, author_data:users(*)")
        .eq("testing_center", input.labId)
        .limit(4)
        .order("created_at", { ascending: false });

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }

      return {
        data,
        total_rating: {
          average: rating?.avg_rating as number,
          count: rating?.rating_count as number,
        },
      };
    }),
  getAllReviews: publicProcedure
    .input(z.object({ labId: z.number() }))
    .query(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase
        .from("reviews")
        .select("*, author_data:users(*)")
        .eq("testing_center", input.labId)
        .order("created_at", { ascending: false });

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
        labId: z.string(),
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
        imageChanged: z.boolean(),
        images: imagesObject,
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
            .eq("id", input.labId);
        }

        if (input.newValues.province !== input.oldValues.province) {
          await ctx.supabase
            .from("locations")
            .update({
              province: input.newValues.province,
            })
            .eq("testing_center", input.labId);
        }

        if (input.newValues.city !== input.oldValues.city) {
          await ctx.supabase
            .from("locations")
            .update({
              city: input.newValues.city,
            })
            .eq("testing_center", input.labId);
        }

        if (input.newValues.region !== input.oldValues.region) {
          await ctx.supabase
            .from("locations")
            .update({
              region: input.newValues.region,
            })
            .eq("testing_center", input.labId);
        }

        if (input.newValues.barangay !== input.oldValues.barangay) {
          await ctx.supabase
            .from("locations")
            .update({
              barangay: input.newValues.barangay,
            })
            .eq("testing_center", input.labId);
        }

        if (input.newValues.zip !== input.oldValues.zip) {
          await ctx.supabase
            .from("locations")
            .update({
              zip: parseInt(input.newValues.zip),
            })
            .eq("testing_center", input.labId);
        }

        if (input.newValues.landmark !== input.oldValues.landmark) {
          await ctx.supabase
            .from("locations")
            .update({
              landmark: input.newValues.landmark,
            })
            .eq("testing_center", input.labId);
        }

        if (input.newValues.services !== input.oldValues.services) {
          await ctx.supabase
            .from("testing_centers")
            .update({
              services: input.newValues.services,
            })
            .eq("id", input.labId);
        }

        if (input.newValues.facebook !== input.oldValues.facebook) {
          await ctx.supabase
            .from("testing_centers")
            .update({
              facebook: input.newValues.facebook,
            })
            .eq("id", input.labId);
        }

        if (input.newValues.contact !== input.oldValues.contact) {
          await ctx.supabase
            .from("testing_centers")
            .update({
              contact: parseInt(input.newValues.contact),
            })
            .eq("id", input.labId);
        }

        if (input.newValues.google_map !== input.oldValues.google_map) {
          await ctx.supabase
            .from("testing_centers")
            .update({
              google_map: input.newValues.google_map,
            })
            .eq("id", input.labId);
        }

        if (
          input.new_thumbnail !== input.old_thumbnail &&
          input.thumbnailChanged &&
          !input.imageChanged
        ) {
          await ctx.supabase
            .from("images")
            .update({
              thumbnail: false,
            })
            .eq("testing_center", input.labId)
            .eq("name", input.old_thumbnail);

          await ctx.supabase
            .from("images")
            .update({
              thumbnail: true,
            })
            .eq("testing_center", input.labId)
            .eq("name", input.new_thumbnail);
        }

        if (input.imageChanged) {
          input.images.forEach(async (image) => {
            const fileKey = getFileKey(image.url);

            await utapi.deleteFiles(fileKey!);
          });

          await ctx.supabase
            .from("images")
            .delete()
            .eq("testing_center", input.labId);
        }

        input.new_open_hours.forEach(async (hour, index) => {
          if (hour.open !== input.old_open_hours[index]?.open) {
            await ctx.supabase
              .from("open_hours")
              .update({
                open_time: hour.open,
              })
              .eq("testing_center", input.labId)
              .eq("day", hour.label);
          }
          if (hour.close !== input.old_open_hours[index]?.close) {
            await ctx.supabase
              .from("open_hours")
              .update({
                close_time: hour.close,
              })
              .eq("testing_center", input.labId)
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
  deleteCenter: protectedProcedure
    .input(
      z.object({
        labId: z.number(),
        images: imagesObject,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      input.images.forEach(async (image) => {
        const fileKey = getFileKey(image.url);

        await utapi.deleteFiles(fileKey!);
      });

      const { error } = await ctx.supabase
        .from("testing_centers")
        .delete()
        .eq("id", input.labId);

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }
    }),
  changeCenterDeactivated: protectedProcedure
    .input(
      z.object({
        labId: z.number(),
        deactivated: z.boolean(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { error } = await ctx.supabase
        .from("testing_centers")
        .update({ deactivated: input.deactivated })
        .eq("id", input.labId)
        .single();

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }

      return true;
    }),
  addReview: protectedProcedure
    .input(
      z.object({
        labId: z.number(),
        author: z.string(),
        rating: z.number(),
        text: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { data: alreadyReviewed } = await ctx.supabase
        .from("reviews")
        .select("*")
        .eq("testing_center", input.labId)
        .eq("author", input.author)
        .limit(1)
        .single();

      if (alreadyReviewed) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You have already reviewed this testing center",
        });
      }

      const { error } = await ctx.supabase.from("reviews").insert({
        testing_center: input.labId,
        rating: input.rating,
        text: input.text,
        author: input.author,
      });

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }
      return true;
    }),
  changeCenterStatus: protectedProcedure
    .input(
      z.object({
        labId: z.number(),
        status: z.enum(["pending", "accepted", "rejected"]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { error } = await ctx.supabase
        .from("testing_centers")
        .update({
          status: input.status,
        })
        .eq("id", input.labId);

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }

      return true;
    }),
});
