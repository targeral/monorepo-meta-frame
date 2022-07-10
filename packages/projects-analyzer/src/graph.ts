import type {
  IBodyNode,
  IGraphNode,
  IProject,
  ITailNode,
  IHeadNode,
} from './type';
import { filterObject, mapObject } from './utils';

export interface IProjectNode {
  name: string;
  path: string;
  deps: { name: string; version: string; isDev: boolean }[];
  isWhoDep: IGraphNode<IProjectNode>[];
  isWhoDevDep: IGraphNode<IProjectNode>[];
}

export const createProjectNodes = (
  projects: IProject[],
  projectNameList: string[],
) => {
  const projectNodes = [];
  for (const project of projects) {
    const projectNode: IProjectNode = {
      name: project.name,
      path: project.path,
      deps: [],
      isWhoDep: [],
      isWhoDevDep: [],
    };

    const handleDeps = (deps: Record<string, string>, isDev: boolean) =>
      mapObject(
        filterObject(deps, (name: string) => {
          return projectNameList.includes(name);
        }),
        (name, version) => {
          return { name, version, isDev };
        },
      );

    if (project.packageJson.dependencies) {
      projectNode.deps = [
        ...projectNode.deps,
        ...handleDeps(project.packageJson.dependencies, false),
      ];
    }

    if (project.packageJson.devDependencies) {
      projectNode.deps = [
        ...projectNode.deps,
        ...handleDeps(project.packageJson.devDependencies, true),
      ];
    }

    projectNodes.push(projectNode);
  }

  return projectNodes;
};

export const isHeadNode = <T>(
  graphNode: IGraphNode<T>,
): graphNode is IHeadNode<T> => graphNode.pre === undefined;

export const createGraphNodeFromProjectNode = (
  projectNode: IProjectNode,
  opts: {
    projectNameList: string[];
    graphNodeHash: Record<string, IGraphNode<IProjectNode>>;
    headNodeHash: Record<string, IHeadNode<IProjectNode>>;
  },
): IGraphNode<IProjectNode> => {
  const { graphNodeHash, headNodeHash } = opts;
  const { name: projectName, deps } = projectNode;

  const crtGraphNode: ITailNode<IProjectNode> | IBodyNode<IProjectNode> = {
    // 可能在之前已经被初始化过一部分字段，例如 name 和 next 字段
    ...(graphNodeHash[projectName] ?? {}),
    name: projectName,
    pre: [],
    extra: projectNode,
  };

  for (const { name } of deps) {
    // maybe is Head Node or Body Node
    let graphNode: IBodyNode<IProjectNode> | IHeadNode<IProjectNode>;
    if (graphNodeHash[name]) {
      graphNodeHash[name].next = [
        ...(graphNodeHash[name].next ?? []),
        crtGraphNode,
      ];
      graphNode = graphNodeHash[name] as
        | IBodyNode<IProjectNode>
        | IHeadNode<IProjectNode>;
    } else {
      graphNode = {
        name,
        next: [crtGraphNode],
      } as IHeadNode<IProjectNode>;
      graphNodeHash[name] = graphNode;
    }

    // current GraphNode is Tail Node or Body Node
    crtGraphNode.pre.push(graphNode);

    if (isHeadNode<IProjectNode>(graphNode)) {
      headNodeHash[graphNode.name] = graphNode;
      // graphNode.relativeNodes[crtGraphNode.name] = crtGraphNode;
    } else if (headNodeHash[graphNode.name]) {
      // 如果节点已经不是 HeadNode，但是在 HeadNodeHash 中，则从 HeadNodeHash 移除它。
      delete headNodeHash[graphNode.name];
    }
  }

  return crtGraphNode;
};

export const parseAssociatedNodeNames = (
  hash: Record<string, IGraphNode<IProjectNode>>,
) => {
  for (const node of Object.values(hash)) {
    let associatedNodeNames: string[] = [];
    let nextNodes = node.next ?? [];
    while (nextNodes.length > 0) {
      associatedNodeNames = [
        ...associatedNodeNames,
        ...nextNodes.map(node => node.name),
      ];
      nextNodes = nextNodes.reduce<IGraphNode<IProjectNode>[]>((ret, node) => {
        if (Array.isArray(node.next)) {
          return [...ret, ...node.next];
        }

        return ret;
      }, []);
    }

    node.associatedNodeNames = Array.from(new Set(associatedNodeNames));
  }
};

export const createGraph = (projects: IProject[]) => {
  const projectNameList = projects.map(project => project.name);
  const projectNodes = createProjectNodes(projects, projectNameList);
  const graphNodeHash: Record<string, IGraphNode<IProjectNode>> = {};
  const headNodeHash: Record<string, IHeadNode<IProjectNode>> = {};

  for (const projectNode of projectNodes) {
    graphNodeHash[projectNode.name] = createGraphNodeFromProjectNode(
      projectNode,
      {
        projectNameList,
        graphNodeHash,
        headNodeHash,
      },
    );
  }
  parseAssociatedNodeNames(headNodeHash);

  return { projectNameList, projectNodes, graphNodeHash, headNodeHash };
};
