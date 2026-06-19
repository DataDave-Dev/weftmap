import { z } from "zod";

// Server Actions are a trust boundary: validate everything a client can send.
// These schemas live in a plain module (not a "use server" file) so they can be
// imported by both the actions and the tests.

const MAX_SOURCE_BYTES = 2_000_000;

export const graphMetaSchema = z.object({
  title: z.string().trim().min(1).max(120),
  language: z.string().trim().min(1).max(20),
});

// The graph is produced by our own analyzer, but a client could POST anything.
// Validate the structural essentials and allow the known optional fields via
// loose objects rather than re-declaring the whole type.
export const graphSchema = z.object({
  nodes: z
    .array(
      z.object({ id: z.string(), label: z.string(), type: z.string() }).loose(),
    )
    .max(5000),
  edges: z
    .array(
      z
        .object({ source: z.string(), target: z.string(), kind: z.string() })
        .loose(),
    )
    .max(20000),
});

export const sourceSchema = z
  .object({
    code: z.string().max(MAX_SOURCE_BYTES).optional(),
    files: z
      .array(z.object({ path: z.string(), content: z.string() }))
      .max(400)
      .optional(),
  })
  .refine((v) => v.code !== undefined || (v.files?.length ?? 0) > 0, {
    message: "Provide 'code' or 'files'.",
  });

export const testimonialSchema = z.object({
  body: z.string().trim().min(3).max(1000),
  rating: z.coerce.number().int().min(1).max(5),
});

export type GraphInput = z.infer<typeof graphSchema>;
export type SourceInput = z.infer<typeof sourceSchema>;
