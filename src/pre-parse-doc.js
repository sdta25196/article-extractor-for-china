import { isProbablyVisible } from "../tools/index.js"

const REGEXPS = {
  unlikelyCandidates: /-ad-|ai2html|banner|breadcrumbs|combx|comment|community|cover-wrap|disqus|extra|footer|gdpr|header|legends|menu|related|remark|replies|rss|shoutbox|sidebar|skyscraper|social|sponsor|supplemental|ad-break|agegate|pagination|pager|popup|yom-remote/i,
  okMaybeItsACandidate: /and|article|body|column|content|main|shadow/i,
}

/**
 * 预解析文档，确定文档是否可被正确解析. 
 * 
 * TODO 后续思路应该改成：预解析页面，分析当前页面属性【文章、列表、聚合页、功能页、未知】
 * 
 * @param {Object} options 配置对象
 * @param {number} [options.minContentLength=140] 最小内容长度
 * @param {number} [options.minScore=20] 最小分数
 * @param {Function} [options.visibilityChecker=isProbablyVisible] 确定节点是否可见
 * @return {boolean} 当前文档是否可被正确解析
 */
function preParse(doc, options = {}) {

  const defaultOptions = { minScore: 20, minContentLength: 140, visibilityChecker: isProbablyVisible }
  options = Object.assign(defaultOptions, options)

  let nodes = doc.querySelectorAll("p, pre, article")

  let brNodes = doc.querySelectorAll("div > br")
  if (brNodes.length) {
    let set = new Set(nodes)
    Array.prototype.forEach.call(brNodes, function (node) {
      set.add(node.parentNode)
    })
    nodes = Array.from(set)
  }
  let score = 0
  return [].some.call(nodes, function (node) {
    if (!options.visibilityChecker(node)) {
      return false
    }

    let matchString = node.className + " " + node.id
    if (REGEXPS.unlikelyCandidates.test(matchString) && !REGEXPS.okMaybeItsACandidate.test(matchString)) {
      return false
    }

    if (node.matches("li p")) { // li 下的 p元素 不计分，通常这个是列表或者导航
      return false
    }

    let textContentLength = node.textContent.trim().length
    if (textContentLength < options.minContentLength) {
      return false
    }
    score += Math.sqrt(textContentLength - options.minContentLength)
    if (score > options.minScore) {
      return true
    }
    return false
  })
}

export default preParse