// // src/validations/taskSchema.ts
import { z } from "zod";

export const createUserSchema = z.object({
  userID: z.string().length(10),
  name: z.string().min(1),
  email: z.string().email({message: "Invalid email format"}),
  phoneNumber: z.string().length(10),
});

export const updateUserSchema = z
  .object({
    userID: z.string().length(10),
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phoneNumber: z.string().length(10).optional(),
  })
  .refine((data) => Object.keys(data).length > 1, {
    message: "At least one field to update must be provided",
  });

export const deleteUserSchema = z.object({
  userID: z.string().length(10)
});

// // Optionally export the inferred TypeScript type:
// export type CreateTaskInput = z.infer<typeof createUserSchema>;
// export type DeleteTaskInput=z.infer<typeof deleteUserSchema>;
// export type UpdateTaskInput=z.infer<typeof updateUserSchema>;
