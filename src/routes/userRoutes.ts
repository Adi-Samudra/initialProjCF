import { Hono } from "hono";
import { zValidator as zv } from "@hono/zod-validator";
import { ZodSchema } from "zod";
import type { ValidationTargets } from "hono";
import {
  createUserSchema,
  updateUserSchema,
  deleteUserSchema,
} from "../validations/userSchema";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { users } from "../db/schema";
import type { Env } from "../worker";
import { ZodError } from "zod";
import { Context } from "hono";
import { HTTPException } from "hono/http-exception";

const userRoutes = new Hono<{ Bindings: Env }>();

export const zValidator = <
  T extends ZodSchema,
  Target extends keyof ValidationTargets
>(
  target: Target,
  schema: T
) =>
  zv(target, schema, (result, c) => {
    if (!result.success) {
        console.log("********\n"+result.error.issues.at(0)?.message);
        const err = new HTTPException(400, { cause: result.error });
        console.log("********\n"+err.cause);
      throw err;
    }
  });

// const errorHandlerMiddleware = async (
//   c: Context,
//   next: () => Promise<void>
// ) => {
//   try {
//     await next();
//     console.log("Error in middleware0");
//     if (c.res.body !== null) {
//       console.log("Error in middleware1");
//       const responseBody = (await c.res.clone().json()) as {
//         error?: { issues?: { message: string }[] };
//       };
//       console.log(responseBody.error?.issues?.[0]?.message);
//       // if (responseBody.error?.issues?.[0]?.message) {
//       return c.json(
//         {
//           success: false,
//           message: responseBody.error?.issues?.[0]?.message,
//         },
//         400
//       );
//       // }
//     }
//   } catch (err: any) {
//     console.log("Error in middleware:", err);
//     // If it's a Zod error, extract and return friendly messages.
//     // if (err instanceof ZodError) {
//     //   console.log("Zod error:", err);
//     //   const messages = err.issues.map((issue) => issue.message).join(", ");
//     //   return c.json({ success: false, message: messages }, 400);
//     // }
//   }
// };
// // Updated error handler
// const errorHandler = (err: Error) => {
//   if (err instanceof Error && err.cause instanceof ZodError) {
//     const zodError = err.cause as ZodError;
//     return {
//       success: false,
//       message: zodError.errors[0].message,
//     };
//   }
//   return {
//     success: false,
//     message: "An unexpected error occurred",
//   };
// };

// userRoutes.use("*", errorHandlerMiddleware);

// userRoutes.onError((err, c) => {
//   const response = errorHandler(err);
//   return c.json(response, response.message.includes("exactly") ? 400 : 500);
// });

userRoutes.post("/create", zValidator("json", createUserSchema), async (c) => {
  const db = drizzle(c.env.DB);
  const body = c.req.valid("json");
  try {
    await db.insert(users).values({
      userID: body.userID,
      name: body.name,
      email: body.email,
      phoneNumber: body.phoneNumber,
    });
    return c.json({ success: true, message: "User created successfully" });
  } catch (e) {
    // Check if the error is a ZodError instance
    if (e instanceof ZodError) {
      const messages = e.issues.map((issue) => issue.message);
      return c.json({ success: false, message: messages.join(", ") }, 400);
    }
    // Handle UNIQUE constraint errors
    console.log("********\n"+e);
    if (e && typeof e === "object" && "message" in e) {
      const errorMessage = e.message as string;
      if (errorMessage.includes("UNIQUE constraint failed")) {
        if (errorMessage.includes("users.email")) {
          return c.json(
            { success: false, message: "Email already exists" },
            409
          );
        }
        if (errorMessage.includes("users.userID")) {
          return c.json(
            { success: false, message: "UserID already exists" },
            409
          );
        }
      }
    }
    console.error("Error creating user:", e);
    return c.json({ success: false, message: "Failed to create user" }, 500);
  }
});

userRoutes.get("/all", async (c) => {
  const db = drizzle(c.env.DB);
  try {
    const allUsers = await db.select().from(users).all();
    return c.json({
      success: true,
      message: allUsers, // Changed from data to message
    });
  } catch (e) {
    return c.json({ success: false, message: "Failed to fetch users" }, 500);
  }
});

userRoutes.get("/:userID", async (c) => {
  const db = drizzle(c.env.DB);
  const userID = c.req.param("userID");
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.userID, userID))
      .get();
    if (!user) {
      return c.json({ success: false, message: "User not found" }, 404);
    }
    return c.json({
      success: true,
      message: user, // Changed from data to message
    });
  } catch (e) {
    return c.json({ success: false, message: "Failed to fetch user" }, 500);
  }
});

userRoutes.patch("/update", zValidator("json", updateUserSchema), async (c) => {
  const db = drizzle(c.env.DB);
  const body = c.req.valid("json");
  try {
    // First check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.userID, body.userID))
      .get();
    if (!existingUser) {
      return c.json({ success: false, message: "User not found" }, 404);
    }
    await db
      .update(users)
      .set({
        name: body.name,
        email: body.email,
        phoneNumber: body.phoneNumber,
      })
      .where(eq(users.userID, body.userID));

    return c.json({ success: true, message: "User updated successfully" });
  } catch (e) {
    return c.json({ success: false, message: "Failed to update user" }, 500);
  }
});

userRoutes.delete(
  "/delete",
  zValidator("json", deleteUserSchema),
  async (c) => {
    const db = drizzle(c.env.DB);
    const body = c.req.valid("json");
    try {
      // First check if user exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.userID, body.userID))
        .get();
      if (!existingUser) {
        return c.json({ success: false, message: "User not found" }, 404);
      }
      await db.delete(users).where(eq(users.userID, body.userID));

      return c.json({ success: true, message: "User deleted successfully" });
    } catch (e) {
      return c.json({ success: false, message: "Failed to delete user" }, 500);
    }
  }
);

export default userRoutes;
