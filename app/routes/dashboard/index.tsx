import { getProjects } from "~/entities/data-reader.ts";
import type { Route } from "./+types/index.ts";
import { useRouteLoaderData } from "react-router";

const title = "ダッシュボード";

export function loader() {
  const projects = getProjects();

  return { projects };
}

export function meta() {
  return [{ title }];
}

export default function Projects({ loaderData }: Route.ComponentProps) {
  const { projects } = loaderData;
  const { userName } = useRouteLoaderData("auth");

  return (
    <>
      <h2 className="mb-12 text-center">{title}</h2>
      <p className="text-center">ようこそ、{userName}さん</p>
      {projects.map((project) => (
        <div key={project.id} className="mb-4">
          <p className="text-sm text-gray-600">ID: {project.id}</p>
          <p className="text-lg font-bold">{project.name}</p>
        </div>
      ))}
    </>
  );
}
