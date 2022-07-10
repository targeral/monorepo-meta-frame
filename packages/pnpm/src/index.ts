import path from 'path';
import { PackageJsonLookup, FileSystem } from '@rushstack/node-core-library';
import { globby, GlobbyOptions, yaml } from '@modern-js/utils';
import pMap from 'p-map';
import type { IProject } from '@mmt/projects-analyzer';
import type { IPnpmWorkSpace } from './type';

export * from './type';

export const normalize = (results: string[]) =>
  results.map((fp: string) => path.normalize(fp));

export const getGlobOpts = (
  rootPath: string,
  packageConfigs: string[],
  ignore: string[] = [],
): GlobbyOptions => {
  const globOpts: any = {
    cwd: rootPath,
    absolute: true,
    expandDirectories: false,
    followSymbolicLinks: false,
  };

  if (packageConfigs.some((cfg: string) => cfg.includes('**'))) {
    if (packageConfigs.some((cfg: string) => cfg.includes('node_modules'))) {
      console.error(
        'An explicit node_modules package path does not allow globstars (**)',
      );
    }

    globOpts.ignore = [
      // allow globs like "packages/**",
      // but avoid picking up node_modules/**/package.json and dist/**/package.json
      '**/dist/**',
      '**/node_modules/**',
      ...(ignore || []),
    ];
  }

  return globOpts;
};

export const makeFileFinder = (
  rootPath: string,
  packageConfigs: string[],
  ignoreConfigs: string[] = [],
) => {
  const globOpts = getGlobOpts(rootPath, packageConfigs, ignoreConfigs);

  return async <FileMapperType>(
    fileName: string,
    fileMapper: (filepath: string[]) => Promise<FileMapperType[]>,
    customGlobOpts: GlobbyOptions = {},
  ) => {
    const options = { ...customGlobOpts, ...globOpts };
    const promise = pMap(
      Array.from(packageConfigs).sort(),
      async (globPath: string) => {
        let result = await globby(path.posix.join(globPath, fileName), options);

        // fast-glob does not respect pattern order, so we re-sort by absolute path
        result = result.sort();
        // POSIX results always need to be normalized
        result = normalize(result);

        return fileMapper(result);
      },
      { concurrency: packageConfigs.length || Infinity },
    );

    // always flatten the results
    const results = await promise;

    return results.reduce((acc, result) => acc.concat(result), []);
  };
};

export const getProjectsByPackageConfig = async (
  rootPath: string,
  packagesConfig: string[],
  ignoreConfigs: string[],
): Promise<IProject[]> => {
  const finder = makeFileFinder(rootPath, packagesConfig, ignoreConfigs);
  const fileName = 'package.json';
  const mapper = (packageConfigPath: string) => {
    const packageJsonLookup = new PackageJsonLookup({ loadExtraFields: true });
    const packageJson =
      packageJsonLookup.loadNodePackageJson(packageConfigPath);
    const projectPath = path.dirname(packageConfigPath);
    return {
      name: packageJson.name || projectPath,
      path: projectPath,
      packageJson,
    };
    // return new Package(packageJson, path.dirname(packageConfigPath), rootPath);
  };
  const projects = await finder(
    fileName,
    filePaths =>
      pMap(filePaths, mapper, { concurrency: filePaths.length || Infinity }),
    {},
  );

  return projects;
};

export const getProjects = async (opts: {
  rootPath: string;
  ignoreConfigs?: string[];
}) => {
  const { rootPath, ignoreConfigs = [] } = opts;
  let packagesConfig: string[] = [];
  const yamlString = await FileSystem.readFileAsync(
    path.resolve(rootPath, 'pnpm-workspace.yaml'),
  ).then(data => data.toString());
  const pnpmWorkspace = yaml.load(yamlString) as IPnpmWorkSpace;
  packagesConfig = pnpmWorkspace.packages || [];

  const projects = await getProjectsByPackageConfig(
    rootPath,
    packagesConfig,
    ignoreConfigs,
  );

  return projects;
};
