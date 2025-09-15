import { Link, Outlet } from "react-router";

export default function Layout() {
  return (
    <>
      <Outlet />
      <hr className="my-4" />
      <div className="flex justify-center">
        <p>認証レイアウト</p>
      </div>
    </>
  );
}