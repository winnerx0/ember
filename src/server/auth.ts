import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { setCookie } from "vinxi/http";

export const setSessionCookies = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      access_token: z.string(),
      refresh_token: z.string(),
    })
  )
  .handler(async ({ data }) => {
    // Set access token cookie (1 hour)
    setCookie("sb-access-token", data.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 3600,
      path: "/",
    });

    // Set refresh token cookie (30 days)
    setCookie("sb-refresh-token", data.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 2592000,
      path: "/",
    });

    return { success: true };
  });

export const clearSessionCookies = createServerFn({ method: "POST" }).handler(
  async () => {
    // Clear cookies by setting maxAge to 0
    setCookie("sb-access-token", "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    setCookie("sb-refresh-token", "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return { success: true };
  }
);
