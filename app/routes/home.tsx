import type { Route } from "./+types/home";
import { href, Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
    <ul className="my-6 space-y-2">
      <li className="flex items-center">
        <Link to={href("/login")}>ログイン</Link>
      </li>
      <li className="flex items-center">
        <Link to={href("/dashboard")}>ダッシュボード</Link>
      </li>
      <li className="flex items-center">
        <Link to={href("/dashboard/settings")}>ダッシュボード設定</Link>
      </li>
    </ul>
  );
}
