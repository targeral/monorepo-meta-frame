// TODO: 写的更通用些
export const filterObject = (
  o: Record<string, string>,
  cb: (input: string) => boolean,
) => {
  const keys = Object.keys(o);
  const retKeys = keys.filter(cb);
  const ret: Record<string, string> = {};

  for (const key of retKeys) {
    ret[key] = o[key];
  }

  return ret;
};

export const mapObject = <T>(
  o: Record<string, string>,
  cb: (key: string, value: string) => T,
) => {
  const keys = Object.keys(o);
  return keys.map((key: string) => {
    return cb(key, o[key]);
  });
};

// graphNode.relativeNodeNames = Array.isArray(graphNode.relativeNodeNames)
//   ? Array.from(
//       // 此时 relativeNodeNames 包括：
//       new Set([
//         // 1. 当前节点的 relativeNodeNames
//         ...graphNode.relativeNodeNames,
//         // 2. 正在创建的节点名称
//         crtGraphNode.name,
//         // 3. 继承正在创建的节点上的 relativeNodeNames，
//         // NB: 因为正在创建的节点也许之前是 HeadNode，不过现在已经不再是 HeadNode，需要将 relativeNodeNames 传递给新的 HeadNode
//         ...(crtGraphNode.relativeNodeNames ?? []),
//       ]),
//     )
//   : [crtGraphNode.name];
