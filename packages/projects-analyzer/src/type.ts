export type { IProject } from './projects';

// node1 -> crtNode -> node2
// task1 -> crtTask -> task2, 其中 crtTask -> task2 表示在完成 crtTask 的情况下，才能继续执行 task2
// 上述同时表示 <项目的依赖> -> <项目> 的过程

export interface IGraphNode<T = null> {
  pre?: IGraphNode<T>[]; // node1
  next?: IGraphNode<T>[]; // node2
  sibling?: IGraphNode;
  associatedNodeNames?: string[];

  name: string;
  extra?: T;
}

export type A<T> = Pick<T, keyof T>;

// 没有 pre 的 Node 叫做头节点
export interface IHeadNode<T> extends IGraphNode<T> {
  next: (ITailNode<T> | IBodyNode<T>)[];
  associatedNodeNames: string[];
}
// 没有 next 的 Node 叫做尾结点
export interface ITailNode<T> extends IGraphNode<T> {
  pre: (IHeadNode<T> | IBodyNode<T>)[];
}

// 没有 next 的 Node 叫做尾结点
export interface IBodyNode<T> extends IGraphNode<T> {
  pre: (IBodyNode<T> | IHeadNode<T>)[];
  next: (IBodyNode<T> | ITailNode<T>)[];
}

// 没有 next 的 Node 叫做单结点
export interface ISingleNode<T> extends IGraphNode<T> {
  pre: undefined;
  next: undefined;
}

export interface ITask {
  from: ITask; // task1
  to: ITask; // task2
}
