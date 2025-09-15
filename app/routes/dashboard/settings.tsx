import type { Route } from "./+types/settings.ts";

const title = "ダッシュボード設定";
export function meta() {
  return [{ title }];
}

export default function Settings(props: Route.ComponentProps) {
  return (
    <>
      <h2 className="mb-12 text-center">{title}</h2>
    </>
  );
}
