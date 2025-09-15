import type { Project } from "~/entities/types.ts";
import projectsData from "../data/projectsData.json";

export function getProjects(): Project[] {
  return projectsData as Project[];
}