import { Hono } from 'hono'
import { zValidator } from "@hono/zod-validator";
import { createUserSchema, updateUserSchema } from "./validations/userSchema";
import { deleteUserSchema } from "./validations/userSchema";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { users } from "./db/schema";
import type { Env } from "./worker";
import { GoogleGenerativeAI } from "@google/generative-ai";


const app = new Hono<{ Bindings: Env; }>();


app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.post("/addUser", zValidator("json", createUserSchema), async (c) => {
  const db = drizzle(c.env.DB);
  const body = c.req.valid("json");
  try {
    const result = await db.insert(users).values({ userID: body.userID, name: body.name, email: body.email });
    if (result && result.success) {
      return c.json({ success: true, message: "User added successfully" });
    }
    else if (result && !result.success) {
      return c.json({ success: false, message: !result.error ? "Unknown error" : !result.error });
    }
  }
  catch (e) {
    return c.json({ success: false, message: e });
  }

});

app.post("/updateUser", zValidator("json", updateUserSchema), async (c) => {
  const db = drizzle(c.env.DB);
  const body = c.req.valid("json");
  try{
    const result = await db.select().from(users).where(eq(users.userID, body.userID)).all();
    if(result && result.length>0){
      const updateResult = await db.update(users).set({name:body.name,email:body.email}).where(eq(users.userID,body.userID));
      if(updateResult && updateResult.success){
        return c.json({success:true,message:"User updated successfully"});
      }
      else{
        return c.json({success:false,message:"Error updating user"});
      }
    }
    else{
      return c.json({success:false,message:"User not found"});
    }
  }
  catch(e){
    return c.json({success:false,message:e});
  }

});

app.get("/getAllUser", async (c) => {
  const db = drizzle(c.env.DB);
  const result = await db.select().from(users).all();
  return c.json(result);
});

app.post("/deleteUser", zValidator("json", deleteUserSchema), async (c) => {
  const db = drizzle(c.env.DB);
  const body = await c.req.valid("json");
  const result = await db.delete(users).where(eq(users.name, body.name));

  if (result.success) {
    return c.json({ success: true, "message": "User deleted successfully" });
  }
})

app.get("/LLM", async (c) => {
  const api_token = c.env.apitoken;
  console.log(api_token);
  const account_id = "b0e6a5b1c1eac4f367363b71681bd4b8";
  const gateway_name = "initialprojectgateway";

  const genAI = new GoogleGenerativeAI(api_token);
  const model = genAI.getGenerativeModel(
    { model: "gemini-2.0-pro-exp-02-05" },
    {
      baseUrl: `https://gateway.ai.cloudflare.com/v1/${account_id}/${gateway_name}/google-ai-studio`,
    },
  );

  return new Response(JSON.stringify(await model.generateContent(["What is Cloudflare?"])), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*', // Adjust this in production
    },
  })
})

app.get("/checkDbConn", async (c) => {
  try {
    const q1 = "SELECT name FROM sqlite_master WHERE type='table';"
    const result = await c.env.DB.prepare(q1).all();
    if (result) {
      return c.json({ success: true, message: result });
    }
    else
      return c.json({ success: false, message: result });
  }
  catch (e) {
    return c.json({ success: false, message: "Error connecting to database" });
  }
});

export default app
