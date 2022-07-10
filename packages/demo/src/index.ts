import { analyzerProjects } from '@mmt/projects-analyzer';
import { getProjects } from '@mmt/pnpm';

const run = async () => {
  // eslint-disable-next-line no-console
  console.time('analyzerProjects');
  const monorepoPath =
    process.env.MONOREPO_PATH || '/Users/targeral/github/modern.js';
  const projects = await getProjects({ rootPath: monorepoPath });
  analyzerProjects(projects);
  // eslint-disable-next-line no-console
  console.timeEnd('analyzerProjects');
};

run();
