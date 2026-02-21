import React, { useState } from 'react';
import Section from './Section';
import { FolderGit2, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { ProjectItem } from '../types';

interface ProjectsProps {
  projects: ProjectItem[];
}

interface ProjectCardProps {
  project: ProjectItem;
  index: number;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const description = project.description || "";
  const maxLength = 120;
  const shouldTruncate = description.length > maxLength;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ 
        scale: 1.02, 
        y: -5,
      }}
      transition={{ duration: 0.3 }}
      viewport={{ once: true }}
      className="group bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 cursor-default flex flex-col overflow-hidden hover:shadow-xl hover:shadow-blue-900/5 dark:hover:shadow-blue-900/10 transition-all h-full"
    >
      {project.image ? (
          <div className="w-full h-48 overflow-hidden relative shrink-0">
              <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
      ) : null}

      <div className="p-6 flex flex-col flex-grow">
          {!project.image && (
              <div className="mb-4">
                  <div className="p-3 bg-blue-50 dark:bg-slate-800 rounded-lg text-blue-600 dark:text-blue-400 inline-block">
                      <FolderGit2 size={24} />
                  </div>
              </div>
          )}
          
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {project.title || "Untitled Project"}
          </h3>
          
          <div className="mb-6 flex-grow">
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                {isExpanded || !shouldTruncate ? description : `${description.slice(0, maxLength)}...`}
            </p>
            {shouldTruncate && (
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
                    }}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-2 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                    {isExpanded ? 'Read Less' : 'Read More'}
                </button>
            )}
          </div>

          {project.link && (
              <a 
                  href={project.link} 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-blue-600 dark:hover:bg-blue-600 text-slate-700 dark:text-slate-300 hover:text-white rounded-xl text-sm font-semibold transition-all duration-300 group/btn mt-auto border border-slate-100 dark:border-slate-700 hover:border-transparent hover:shadow-lg hover:shadow-blue-500/20"
              >
                  View Live Demo
                  <ExternalLink size={16} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
              </a>
          )}
      </div>
    </motion.div>
  );
};

const Projects: React.FC<ProjectsProps> = ({ projects }) => {
  return (
    <Section id="projects" className="bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="text-center mb-12">
         <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-slate-900 dark:text-white inline-flex items-center gap-3"
         >
            <FolderGit2 className="text-blue-600" size={32} />
            Featured Projects
         </motion.h2>
         <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-slate-600 dark:text-slate-400 mt-4 max-w-2xl mx-auto"
         >
            A selection of professional engagements and case studies demonstrating my accounting and bookkeeping expertise.
         </motion.p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects && projects.length > 0 ? (
            projects.map((project, index) => (
            <ProjectCard key={project.id || index} project={project} index={index} />
            ))
        ) : (
            <div className="col-span-full text-center text-slate-500 py-10">No projects to display.</div>
        )}
      </div>
    </Section>
  );
};

export default Projects;