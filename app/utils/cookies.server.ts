import { createCookie } from "react-router";

export const idTokenCookie = createCookie("id-token", {
  maxAge: 60 * 60 * 24, // 1 day
  secure: true,
  httpOnly: true,
  sameSite: "strict",
  path: "/",
});

export const refreshTokenCookie = createCookie("refresh-token", {
  maxAge: 60 * 60 * 24 * 7, // 1 week
  secure: true,
  httpOnly: true,
  sameSite: "strict",
  path: "/",
});
