import type { projectDetails } from "../types";
import ProjectCard from "./projectCard";

export default function ProjectList({projectsList} : {
    projectsList : projectDetails[]
}) {
    return <>
        <div>
            <div>

            </div>
            <div className="grid">
                {projectsList.map((project)=>{
                    return <>
                        <ProjectCard key={project.id} props={project} />
                    </>
                })}
            </div>
        </div>
    </>
}