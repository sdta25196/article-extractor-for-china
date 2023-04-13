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

/** dfs 获取下一个节点，如果第二个参数为true则返回兄弟节点 */
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

export const removeAndGetNext = (node) => {
  let nextNode = getNextNode(node, true);
  node.parentNode.removeChild(node);
  return nextNode;
}

/** 判断 node 可能是可见的 */
export const isProbablyVisible = (node) => {
  return (!node.style || node.style.display != "none") // style 
    && !node.hasAttribute("hidden") // attr
    && (!node.hasAttribute("aria-hidden") || node.getAttribute("aria-hidden") != "true"); // 无障碍属性
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

/** 长度小于20的字符串才有可能是作者 */
export const isValidByline = (byline) => {
  if (typeof byline == "string" || byline instanceof String) {
    byline = byline.trim();
    return (byline.length > 0) && (byline.length < 20);
  }
  return false;
}

/**
  * 检查节点祖先是否拥有指定标签
  * @param  HTMLElement node
  * @param  String      tagName
  * @param  Number      maxDepth
  * @param  Function    找到标签后的附加判断逻辑
  * @return Boolean
  */
export const hasAncestorTag = (node, tagName, maxDepth, filterFn) => {
  maxDepth = maxDepth || 3;
  tagName = tagName.toUpperCase();
  let depth = 0;
  while (node.parentNode) {
    if (maxDepth > 0 && depth > maxDepth)
      return false;
    if (node.parentNode.tagName === tagName && (!filterFn || filterFn(node.parentNode)))
      return true;
    node = node.parentNode;
    depth++;
  }
  return false;
}