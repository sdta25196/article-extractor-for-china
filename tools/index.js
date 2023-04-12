/** 计算字数 */
export const wordCount = (str) => str.length

/** 对比两个文本，返回 0-1的数字， 0完全不同，1完全相同 */
export const textSimilarity = (textA, textB) => {
  let tokensA = textA.toLowerCase().split(/\W+/g).filter(Boolean);
  let tokensB = textB.toLowerCase().split(/\W+/g).filter(Boolean);
  if (!tokensA.length || !tokensB.length) {
    return 0;
  }
  let uniqTokensB = tokensB.filter(token => !tokensA.includes(token));
  let distanceB = uniqTokensB.join(" ").length / tokensB.join(" ").length;
  return 1 - distanceB;
}

/** 获取 node下的所有指定 tag */
export const getAllNodesWithTag = (node, tagNames) => {
  if (node.querySelectorAll) {
    return node.querySelectorAll(tagNames.join(","));
  }
  // 利用 apply 第二个参数是数组的特型实现扁平化
  return [].concat.apply([], tagNames.map(function (tag) {
    let collection = node.getElementsByTagName(tag);
    return Array.isArray(collection) ? collection : Array.from(collection);
  }));
}

/** 获取下一个节点，第二个参数为true则返回兄弟节点 */
export const getNextNode = (node, ignoreSelfAndKids) => {
  if (!ignoreSelfAndKids && node.firstElementChild) {
    return node.firstElementChild;
  }
  if (node.nextElementSibling) {
    return node.nextElementSibling;
  }

  // dfs, 向上找兄弟节点
  do {
    node = node.parentNode;
  } while (node && !node.nextElementSibling);
  return node && node.nextElementSibling;
}

/** 把 node 替换为 tag, 返回新的节点 */
export const setNodeTag = (node, tag) => {
  let replacement = node.ownerDocument.createElement(tag);
  while (node.firstChild) {
    replacement.appendChild(node.firstChild);
  }
  node.parentNode.replaceChild(replacement, node);
  if (node.readability)
    replacement.readability = node.readability;

  for (let i = 0; i < node.attributes.length; i++) {
    try {
      replacement.setAttribute(node.attributes[i].name, node.attributes[i].value);
    } catch (ex) {
      // 如果不是有效属性名，setAttribute会抛出异常，不用管 https://github.com/whatwg/html/issues/4275
    }
  }
  return replacement;
}

/** concat所有 arguments，数组合并 */
export const concatNodeLists = () => {
  let slice = Array.prototype.slice;
  let args = slice.call(arguments);
  let nodeLists = args.map(function (list) {
    return slice.call(list);
  });
  return Array.prototype.concat.apply([], nodeLists);
}