import { c as createServerRpc } from "./createServerRpc-Bd3B-Ah9.js";
import { z } from "zod";
import { setCookie } from "vinxi/http";
import { c as createServerFn } from "../server.js";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core";
import "node:async_hooks";
import "@tanstack/router-core/ssr/server";
import "h3-v2";
import "tiny-invariant";
import "seroval";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
import "@tanstack/react-router";
const setSessionCookies_createServerFn_handler = createServerRpc({
  id: "12ff7462a09098a0654158fb38402f7272629f2663cd705cb09c09eca32923fb",
  name: "setSessionCookies",
  filename: "src/server/auth.ts"
}, (opts) => setSessionCookies.__executeServer(opts));
const setSessionCookies = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  access_token: z.string(),
  refresh_token: z.string()
})).handler(setSessionCookies_createServerFn_handler, async ({
  data
}) => {
  setCookie("sb-access-token", data.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 3600,
    path: "/"
  });
  setCookie("sb-refresh-token", data.refresh_token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 2592e3,
    path: "/"
  });
  return {
    success: true
  };
});
const clearSessionCookies_createServerFn_handler = createServerRpc({
  id: "d049fd6abe1f445361c56434f32f3b127b0b401d1a2348743679ad569e5739e0",
  name: "clearSessionCookies",
  filename: "src/server/auth.ts"
}, (opts) => clearSessionCookies.__executeServer(opts));
const clearSessionCookies = createServerFn({
  method: "POST"
}).handler(clearSessionCookies_createServerFn_handler, async () => {
  setCookie("sb-access-token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 0,
    path: "/"
  });
  setCookie("sb-refresh-token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 0,
    path: "/"
  });
  return {
    success: true
  };
});
export {
  clearSessionCookies_createServerFn_handler,
  setSessionCookies_createServerFn_handler
};
