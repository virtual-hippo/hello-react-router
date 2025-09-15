import { Outlet, redirect } from "react-router";
import type { Route } from "./+types/auth";

import { verifyToken, type User } from "../../utils/auth.server.ts";

export type AuthContext = {
  readonly isAuth: boolean;
};

export async function loader({ request }: Route.LoaderArgs) {
  const cookie = request.headers.get("Cookie");
  const token = cookie
    ?.split("; ")
    .find((row) => row.startsWith("auth-token="))
    ?.split("=")[1];

  try {
    const jwtPayLoad = token && (await verifyToken(token));

    if (!jwtPayLoad) {
      // トークンが無効な場合
      throw redirect("/login", {
        headers: {
          "Set-Cookie": "auth-token=; Path=/; HttpOnly; Secure; Max-Age=0",
        },
      });
    }

    // jwtPayLoad の中身は、createToken() で指定したペイロードになっているはず
    const user = jwtPayLoad as Omit<User, "auth">;
    return { userName: user?.name ?? "Unknown" };
  } catch {
    // トークンの検証に失敗した場合
    throw redirect("/login", {
      headers: {
        "Set-Cookie": "auth-token=; Path=/; HttpOnly; Secure; Max-Age=0",
      },
    });
  }
}

export default function Layout({ loaderData }: Route.ComponentProps) {
  const { userName } = loaderData;

  return (
    <>
      <Outlet />
    </>
  );
}
