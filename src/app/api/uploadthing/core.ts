import { createUploadthing, type FileRouter } from "uploadthing/next";
import { z } from "zod";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 6 } })
    // Set permissions and file types for this FileRoute
    .input(
      z.object({
        preview: z.string(),
        testing_center_id: z.string(),
      }),
    )
    .middleware(({ input }) => {
      return {
        preview: input.preview,
        id: input.testing_center_id,
      };
    })
    .onUploadComplete(async ({ file, metadata }) => {

      // This code RUNS ON YOUR SERVER after upload
      const preview = metadata.preview;
      const id = metadata.id;
      const url = file.url

      return { name: file.name };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
