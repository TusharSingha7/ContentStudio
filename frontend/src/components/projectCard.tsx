import type { projectDetails } from "../types";


export default function ProjectCard({props} : {props : projectDetails}) {
    return <>
    <div>
        <div>{props.title} </div>
        <div>{props.description}</div>
        <div>{props.link}</div>
    </div>
    </>
}