import sanitize from 'sanitize-html'
import { pipe } from 'bellajs'
import {
  DEPRECATED_SIZE_ATTRIBUTE_ELEMS, ELEMENT_NODE,
  HTML_ESCAPE_MAP,
  PRESENTATIONAL_ATTRIBUTES, REGEXPS, TEXT_NODE
} from "../src/type.js"

/** 计算字数 */
export const wordCount = (str) => str.length

/** 对比两个文本，返回 0-1的数字， 0完全不同，1完全相同 */
export const textSimilarity = (textA, textB) => {
  let tokensA = textA.toLowerCase().split(REGEXPS.tokenize).filter(Boolean)
  let tokensB = textB.toLowerCase().split(REGEXPS.tokenize).filter(Boolean)
  if (!tokensA.length || !tokensB.length) {
    return 0
  }
  let uniqTokensB = tokensB.filter(token => !tokensA.includes(token))
  let distanceB = uniqTokensB.join(" ").length / tokensB.join(" ").length
  return 1 - distanceB
}

/** 获取 node下的所有指定 tag */
export const getAllNodesWithTag = (node, tagNames) => {
  if (node.querySelectorAll) {
    return node.querySelectorAll(tagNames.join(","))
  }
  // 利用 apply 第二个参数是数组的特型实现扁平化
  return [].concat.apply([], tagNames.map(function (tag) {
    let collection = node.getElementsByTagName(tag)
    return Array.isArray(collection) ? collection : Array.from(collection)
  }))
}

/** dfs 获取下一个节点，如果第二个参数为true则返回兄弟节点 */
export const getNextNode = (node, ignoreSelfAndKids) => {
  if (!ignoreSelfAndKids && node.firstElementChild) {
    return node.firstElementChild
  }
  if (node.nextElementSibling) {
    return node.nextElementSibling
  }

  // dfs, 向上找兄弟节点
  do {
    node = node.parentNode
  } while (node && !node.nextElementSibling)
  return node && node.nextElementSibling
}

export const removeAndGetNext = (node) => {
  let nextNode = getNextNode(node, true)
  node.parentNode.removeChild(node)
  return nextNode
}

/** 判断 node 可能是可见的 */
export const isProbablyVisible = (node) => {
  return (!node.style || node.style.display != "none") // style 
    && !node.hasAttribute("hidden") // attr
    && (!node.hasAttribute("aria-hidden") || node.getAttribute("aria-hidden") != "true"); // 无障碍属性
}

/** 把 node 替换为 tag, 返回新的节点 */
export const setNodeTag = (node, tag) => {
  let replacement = node.ownerDocument.createElement(tag)
  while (node.firstChild) {
    replacement.appendChild(node.firstChild)
  }
  node.parentNode.replaceChild(replacement, node)
  if (node.readability)
    replacement.readability = node.readability

  for (let i = 0; i < node.attributes.length; i++) {
    try {
      replacement.setAttribute(node.attributes[i].name, node.attributes[i].value)
    } catch (ex) {
      // 如果不是有效属性名，setAttribute会抛出异常，不用管 https://github.com/whatwg/html/issues/4275
    }
  }
  return replacement
}

/** concat所有 arguments，数组合并 */
export const concatNodeLists = () => {
  let slice = Array.prototype.slice
  let args = slice.call(arguments)
  let nodeLists = args.map(function (list) {
    return slice.call(list)
  })
  return Array.prototype.concat.apply([], nodeLists)
}

/** 长度小于20的字符串才有可能是作者 */
export const isValidAuthor = (author) => {
  if (typeof author == "string" || author instanceof String) {
    author = author.trim()
    return (author.length > 0) && (author.length < 20)
  }
  return false
}

/** 验证时间格式 */
export const isValidTime = (time) => {
  if (typeof time == "string" || time instanceof String) {
    time = cleanify(time)
    const timeDensity = (time.match(REGEXPS.checkTime)?.length || 0) / time.length
    return (time.length < 30) && (timeDensity > 0.6)
  }
  return false
}

/** 处理冒号，取第一个冒号后面到第二个冒号前面的文案 */
export const handleColons = (text) => {
  const colons = text.match(/：/g) || []
  if (colons.length === 1) {
    text = text.split(/： ?/)[1]
  }
  if (colons.length > 1) {
    text = text.match(/：(.+) .[^ ]+：/)[1]
  }
  return text
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
  maxDepth = maxDepth || 3
  tagName = tagName.toUpperCase()
  let depth = 0
  while (node.parentNode) {
    if (maxDepth > 0 && depth > maxDepth)
      return false
    if (node.parentNode.tagName === tagName && (!filterFn || filterFn(node.parentNode)))
      return true
    node = node.parentNode
    depth++
  }
  return false
}

/** 获取节点内容，normalizeSpaces 为是否删除多余的空白，默认true */
export const getInnerText = (e, normalizeSpaces = true) => {
  let textContent = e.textContent.trim()

  if (normalizeSpaces) {
    return textContent.replace(REGEXPS.normalize, " ")
  }
  return textContent
}

/** 清除样式属性 // TODO 可能 getElementsByTagName(*) 更快 */
export const cleanStyles = (e) => {
  if (!e || e.tagName.toLowerCase() === "svg") return

  // 删除 style 和弃用属性
  for (let i = 0; i < PRESENTATIONAL_ATTRIBUTES.length; i++) {
    e.removeAttribute(PRESENTATIONAL_ATTRIBUTES[i])
  }

  if (DEPRECATED_SIZE_ATTRIBUTE_ELEMS.indexOf(e.tagName) !== -1) {
    e.removeAttribute("width")
    e.removeAttribute("height")
  }

  let cur = e.firstElementChild
  while (cur !== null) {
    cleanStyles(cur)
    cur = cur.nextElementSibling
  }
}

/** 获取字符串s在节点中出现的次数 */
export const getCharCount = (e, s) => {
  return getInnerText(e).split(s).length - 1
}

/** 检查节点是否为图像，或者节点是否仅包含一个图像，无论是作为直接子图像还是作为其后代图像。  */
export const isSingleImage = (node) => {
  if (node.tagName === "IMG") {
    return true
  }

  if (node.children.length !== 1 || node.textContent.trim() !== "") {
    return false
  }

  return isSingleImage(node.children[0])
}

function logNode(node) {
  if (node.nodeType == TEXT_NODE) {
    return `${node.nodeName} ("${node.textContent}")`
  }
  let attrPairs = Array.from(node.attributes || [], function (attr) {
    return `${attr.name}="${attr.value}"`
  }).join(" ")
  return `<${node.localName} ${attrPairs}>`
}

/** log */
export function debugLog() {
  let args = Array.from(arguments, arg => {
    if (arg && arg.nodeType == ELEMENT_NODE) {
      return logNode(arg)
    }
    return arg
  })
  args.unshift("执行：")
  console.log.apply(console, args)
}

export function releaseLog() { }



/** 将字符串中的一些常见HTML实体转换为相应的字符。返回新的字符串  */
export function unescapeHtmlEntities(str) {
  if (!str) {
    return str
  }

  let htmlEscapeMap = HTML_ESCAPE_MAP
  return str.replace(/&(quot|amp|apos|lt|gt);/g, function (_, tag) {  // > < 等
    return htmlEscapeMap[tag]
  }).replace(/&#(?:x([0-9a-z]{1,4})|([0-9]{1,4}));/gi, function (_, hex, numStr) { // &#60  &#x2564
    let num = parseInt(hex || numStr, hex ? 16 : 10)
    return String.fromCharCode(num)
  })
}

const WS_REGEXP = /^[\s\f\n\r\t\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000\ufeff\x09\x0a\x0b\x0c\x0d\x20\xa0]+$/ // eslint-disable-line

const stripMultispaces = (str) => str.replace(WS_REGEXP, ' ').replace(/  +/g, ' ').trim()

const stripMultiLinebreaks = (str) => {
  return str.replace(/(\r\n|\n|\u2424){2,}/g, '\n').split('\n').map((line) => {
    return WS_REGEXP.test(line) ? line.trim() : line
  }).filter((line) => {
    return line.length > 0
  }).join('\n')
}

/** 清理空白符 */
export const cleanify = (str) => {
  return pipe(
    input => stripMultiLinebreaks(input),
    input => stripMultispaces(input)
  )(str)
}

/** 净化 html - // ! 暂时用处不太，主要等后续配合优化用 */
export const purify = (html) => {
  return sanitize(html, {
    allowedTags: false, // 允许所有的标签
    allowedAttributes: false, // 允许所有的属性
    allowVulnerableTags: true, // 屏蔽因为允许script等危险标签而带来的警告
  })
}