import { Outlet, redirect } from "react-router";
import type { Route } from "./+types/auth";

import { verifyToken, type User } from "../../utils/auth.server.ts";

export async function loader({ request }: Route.LoaderArgs) {
  const cookie = request.headers.get("Cookie");
  const token = cookie
    ?.split("; ")
    .find((row) => row.startsWith("id-token="))
    ?.split("=")[1];

  // トークンが存在しない場合はログイン画面へリダイレクト
  if (!token) {
    throw redirect("/login", {
      headers: {
        "Set-Cookie": "auth-token=; Path=/; HttpOnly; Secure; Max-Age=0",
      },
    });
  }

  try {
    const user = await verifyToken(token);
    return { userName: user?.name ?? "Unknown" };
  } catch {
    // トークンの検証に失敗した場合はログイン画面へリダイレクト
    throw redirect("/login", {
      headers: {
        "Set-Cookie": "auth-token=; Path=/; HttpOnly; Secure; Max-Age=0",
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
