import ts from 'typescript';

/** @internal */
export function traverseSourceFile(
  sourceFile: ts.SourceFile,
  callback: (node: ts.Node) => void
) {
  const traverseNode = (node: ts.Node) => {
    callback(node);
    ts.forEachChild(node, traverseNode);
  };

  traverseNode(sourceFile);
}
