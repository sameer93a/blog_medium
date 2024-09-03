import { Hono } from "hono";
import { signupInput, signinInput } from "@sameer93a/medium_common";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign } from "hono/jwt";

export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

userRouter.post("/signup", async (c) => {
  const body = await c.req.json();
  const data = signinInput.safeParse(body);
  if (!data.success) {
    return c.json(
      {
        msg: "Inputs are not correct",
      },
      411
    );
  }
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const user = await prisma.user.create({
      data: {
        username: body.username,
        password: body.password,
        name: body.name,
      },
    });
    const jwt = await sign(
      {
        id: user.id,
      },
      c.env.JWT_SECRET
    );
    return c.text(jwt);
  } catch (e) {
    console.log(e);
    c.status(411);
    return c.text("Invalid");
  }
});
