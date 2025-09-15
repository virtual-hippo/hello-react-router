import { Link, Outlet } from "react-router";

export default function Layout() {
  return (
    <>
      <Outlet />
      <hr className="my-4" />
      <div className="flex justify-center">
        <Link to="/">トップへ戻る</Link>
      </div>
    </>
  );
}