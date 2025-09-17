import { Outlet, redirect } from "react-router";
import type { Route } from "./+types/auth";

import { verifyIdToken } from "~/utils/auth.server.ts";
import { idTokenCookie } from "~/utils/cookies.server.ts";

export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await idTokenCookie.parse(cookieHeader)) || {};

  // トークンが存在しない場合はログイン画面へリダイレクト
  if (!cookie["id-token"]) {
    throw redirect("/login");
  }

  try {
    const user = verifyIdToken(cookie["id-token"]);
    return { userName: user?.name ?? "Unknown" };
  } catch {
    // トークンの検証に失敗した場合はログイン画面へリダイレクト
    // refresh トークンを使って再発行する処理を入れたいが今回は実装をサボる
    cookie["id-token"] = "";
    throw redirect("/login", {
      headers: {
        "Set-Cookie": await idTokenCookie.serialize(cookie, { maxAge: 0 }),
      },
    });
  }
}

export default function Layout() {
  return (
    <>
      <Outlet />
    </>
  );
}
