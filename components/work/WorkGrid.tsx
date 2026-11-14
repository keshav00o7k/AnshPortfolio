"use client";

import React, { useState } from "react";
import { Project } from "@/types";
import { ProjectCard } from "@/components/work/ProjectCard";
import { VideoModal } from "@/components/work/VideoModal";

interface WorkGridProps {
  projects: Project[];
}

export const WorkGrid: React.FC<WorkGridProps> = ({ projects }) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(null);

  const handleOpenModal = (project: Project, element: HTMLElement) => {
    setActiveId(null);
    setTriggerElement(element);
    setSelectedProject(project);
  };

  const handleCloseModal = () => {
    setSelectedProject(null);
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 lg:gap-8 w-full">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            isActive={!selectedProject && activeId === project.id}
            onHover={(id) => setActiveId(id)}
            onLeave={() => setActiveId(null)}
            onInView={(id) => setActiveId(id)}
            onClick={handleOpenModal}
          />
        ))}
      </div>

      <VideoModal
        project={selectedProject}
        onClose={handleCloseModal}
        triggerElement={triggerElement}
      />
    </>
  );
};

