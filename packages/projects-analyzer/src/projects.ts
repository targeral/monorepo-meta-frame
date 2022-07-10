import type { INodePackageJson } from '@rushstack/node-core-library';
import { createGraph } from './graph';

export interface IProject {
  name: string;
  packageJson: INodePackageJson;
  path: string;
}

export const analyzerProjects = (projects: IProject[]) => {
  const { headNodeHash } = createGraph(projects);

  // Debug
  for (const [name, headNode] of Object.entries(headNodeHash)) {
    console.info(
      name,
      headNode.associatedNodeNames.length,
      headNode.associatedNodeNames,
    );
  }
};
