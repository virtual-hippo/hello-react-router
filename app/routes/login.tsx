import { Form, redirect, useActionData } from "react-router";
import type { Route } from "./+types/login";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

  //
  // ダミー認証
  // Production では、認証サーバーに問い合わせるなどの処理を行う
  //

  if (email !== "valid@valid.com") {
    return {
      error: "ログインに失敗しました",
    };
  }

  const token = "valid-token";

  // クッキーにJWTトークンを設定してリダイレクト
  return redirect("/dashboard", {
    headers: {
      "Set-Cookie": `auth-token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`, // 7日間
    },
  });
}

export async function loader({ request }: Route.LoaderArgs) {
  const cookie = request.headers.get("Cookie");
  const hasToken = cookie?.includes("auth-token=");

  if (hasToken) {
    return redirect("/dashboard");
  }

  return;
}

export default function Login({ actionData }: Route.ComponentProps) {
  return (
    <div className="login-container">
      <h1>Login</h1>

      <Form method="post" className="login-form">
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            required
            autoComplete="email"
            className="border border-gray-500"
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className="border border-gray-500"
          />
        </div>

        {actionData?.error && (
          <div className="error-message">{actionData.error}</div>
        )}

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Login
        </button>
      </Form>
    </div>
  );
}
