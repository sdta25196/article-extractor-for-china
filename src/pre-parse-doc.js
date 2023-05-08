import { isProbablyVisible } from "../tools/index.js"

const REGEXPS = {
  unlikelyCandidates: /-ad-|ai2html|banner|breadcrumbs|combx|comment|community|cover-wrap|disqus|extra|footer|gdpr|header|legends|menu|related|remark|replies|rss|shoutbox|sidebar|skyscraper|social|sponsor|supplemental|ad-break|agegate|pagination|pager|popup|yom-remote/i,
  okMaybeItsACandidate: /and|article|body|column|content|main|shadow/i,
}

/**
 * 预解析文档，确定文档是否可被正确解析. 
 * 
 * TODO 后续思路应该改成：预解析页面，分析当前页面属性【文章、列表、聚合页、功能页、未知】
 * ! 第一步：先分析当前是不是文章详情页
 * ! 1. 详情页的 类列表 会比较少
 * ! 2. 详情页的 url 多数是 数字id、detail
 * ! 3. 详情页的 url 不会是list、download
 * ! 4. 详情页有可能有大段内容
 * ! 5. 某些框架的详情 url 是固定格式的
 * ! 尝试删除某些元素之后，利用剩下的元素进行拆分？
 * ! 
 * ! ！！ 这个好像利用URL就够可识别了？？？
 * ! 
 * @param {Object} options 配置对象
 * @param {number} [options.minScore=20] 最小分数
 * @param {number} [options.minContentLength=140] 最小内容长度
 * @param {Function} [options.visibilityChecker=isProbablyVisible] 确定节点是否可见
 * @return {boolean} 当前文档是否可被正确解析
 */
function preParse(doc, options = {}) {

  const defaultOptions = { minScore: 20, minContentLength: 140, visibilityChecker: isProbablyVisible }
  options = { ...defaultOptions, ...options }

  let nodes = doc.querySelectorAll("p, pre, article")

  let brNodes = doc.querySelectorAll("div > br")
  if (brNodes.length) {
    let set = new Set(nodes)
    Array.prototype.forEach.call(brNodes, function (node) {
      set.add(node.parentNode)
    })
    nodes = Array.from(set)
  }

  // ! 搞到了p,pre,article,子元素有br的div。

  let score = 0
  return [].some.call(nodes, function (node) {
    // ! 这个元素不可见，不算
    if (!options.visibilityChecker(node)) {
      return false
    }

    // ! class 和 id不符合预期，不算
    let matchString = node.className + " " + node.id
    if (REGEXPS.unlikelyCandidates.test(matchString) && !REGEXPS.okMaybeItsACandidate.test(matchString)) {
      return false
    }

    // ! li 下的 p 元素，不算。通常这个是列表或者导航
    if (node.matches("li p")) { // li 下的 p元素 不计分，通常这个是列表或者导航
      return false
    }

    // ! 元素内容比预设长度（默认140）小，不算
    let textContentLength = node.textContent.trim().length
    if (textContentLength < options.minContentLength) {
      return false
    }
    // ! 分数规则，元素内容超出预设长度（默认140）部分的平方根。
    score += Math.sqrt(textContentLength - options.minContentLength)
    // ! 分数够了（默认20），就符合标准
    if (score > options.minScore) {
      return true
    }
    return false
  })
}

export default preParse