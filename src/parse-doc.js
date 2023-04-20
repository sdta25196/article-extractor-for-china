import {
  cleanStyles, isValidAuthor, getAllNodesWithTag, getInnerText, getNextNode,
  hasAncestorTag, isProbablyVisible, removeAndGetNext, setNodeTag, textSimilarity,
  getCharCount, debugLog, releaseLog, cleanify, unescapeHtmlEntities, handleColons, isValidTime
} from "../tools/index.js"
import {
  ALTER_TO_DIV_EXCEPTIONS, DEFAULT_CHAR_THRESHOLD, DEFAULT_MAX_ELEMS_TO_PARSE,
  DEFAULT_N_TOP_CANDIDATES, DEFAULT_TAGS_TO_SCORE, DIV_TO_P_ELEMS, ELEMENT_NODE,
  HTML_ESCAPE_MAP, PHRASING_ELEMS, REGEXPS, TEXT_NODE, UNLIKELY_ROLES
} from "./type.js"

/**
*
* @author : 田源
* @date : 2023-04-10 14:24
* @description : 
* @param  doc    documnet实例
* @param  options 配置项
*
*/
export default class ParseDOC {
  FLAG_STRIP_UNLIKELYS = 0x1
  FLAG_WEIGHT_CLASSES = 0x2
  FLAG_CLEAN_CONDITIONALLY = 0x4

  CLASSES_TO_PRESERVE = ["page"]

  constructor(doc, options = {
    debug,
    maxElemsToParse,
    nbTopCandidates,
    charThreshold,
    classesToPreserve,
    keepClasses,
    serializer,
    allowedVideoRegex,
  }) {
    if (!doc || !doc.documentElement) {
      throw new Error("第一个参数必须传入一个doc对象")
    }

    this._doc = doc
    /** 文章标题 */
    this._articleTitle = null
    /** 文章发布时间 */
    this._articleTime = null
    /** 文章作者 */
    this._articleAuthor = null
    /** 文章站点名称 */
    this._articleSiteName = doc.baseURI
    /** 存放候选节点的临时数组 */
    this._attempts = []

    /** 调试模式 */
    this._debug = !!options.debug
    this.log = this._debug ? debugLog : releaseLog

    /** 可处理文档的最大元素数，超出抛异常，默认 0，不限制。 */
    this._maxElemsToParse = options.maxElemsToParse || DEFAULT_MAX_ELEMS_TO_PARSE
    /** 挑选最佳节点时的候选数量 默认 5 */
    this._nbTopCandidates = options.nbTopCandidates || DEFAULT_N_TOP_CANDIDATES
    /** 文章默认字数，默认 500 */
    this._charThreshold = options.charThreshold || DEFAULT_CHAR_THRESHOLD
    /** 清空class的时候排除这个数组中的class，默认 ["page"] */
    this._classesToPreserve = this.CLASSES_TO_PRESERVE.concat(options.classesToPreserve || [])
    /** 是否保留class, 如果设置为false，就会清空class, 默认 false */
    this._keepClasses = !!options.keepClasses
    /** dom格式化函数, 默认为取 dom 的 innerHTML */
    this._serializer = options.serializer || (el => el.innerHTML)
    /** 匹配视频网站的的正则表达式 */
    this._allowedVideoRegex = options.allowedVideoRegex || REGEXPS.videos
    /** 初始设置所有标志 */
    this._flags = this.FLAG_STRIP_UNLIKELYS | this.FLAG_WEIGHT_CLASSES | this.FLAG_CLEAN_CONDITIONALLY
  }

  /** 确定文章内容后进行的处理、转义相对地址，删除空白标签，清空class */
  _postProcessContent(articleContent) {
    this._fixRelativeUris(articleContent)

    this._simplifyNestedElements(articleContent)

    if (!this._keepClasses) {
      this._cleanClasses(articleContent)
    }
  }

  /** 循环nodelist ,对node使用filterFn，进行删除节点的操作，filterFn不传则默认删除，filterFn => boolean */
  _removeNodes(nodeList, filterFn) {
    for (let i = nodeList.length - 1; i >= 0; i--) {
      let node = nodeList[i]
      let parentNode = node.parentNode
      if (parentNode) {
        if (!filterFn || filterFn.call(this, node, i, nodeList)) {
          parentNode.removeChild(node)
        }
      }
    }
  }

  /** 把一组nodelist 替换为指定tag */
  _replaceNodeTags(nodeList, newTagName) {
    for (const node of nodeList) {
      setNodeTag(node, newTagName)
    }
  }

  /** 提供 nodeList Array.forEach的能力，参数fn不可使用箭头函数 */
  _forEachNode(nodeList, fn) {
    Array.prototype.forEach.call(nodeList, fn, this)
  }

  /** 提供 nodeList Array.find的能力，参数fn不可使用箭头函数 */
  _findNode(nodeList, fn) {
    return Array.prototype.find.call(nodeList, fn, this)
  }

  /** 提供 nodeList Array.some的能力，参数fn不可使用箭头函数 */
  _someNode(nodeList, fn) {
    return Array.prototype.some.call(nodeList, fn, this)
  }

  /** 提供 nodeList Array.every的能力，参数fn不可使用箭头函数 */
  _everyNode(nodeList, fn) {
    return Array.prototype.every.call(nodeList, fn, this)
  }

  /** 深搜dfs 删除class，受保护的class不删除  */
  _cleanClasses(node) {
    let classesToPreserve = this._classesToPreserve
    let className = (node.getAttribute("class") || "")
      .split(/\s+/)
      .filter(function (cls) {
        return classesToPreserve.indexOf(cls) != -1
      })
      .join(" ")

    if (className) {
      node.setAttribute("class", className)
    } else {
      node.removeAttribute("class")
    }

    for (node = node.firstElementChild; node; node = node.nextElementSibling) {
      this._cleanClasses(node)
    }
  }

  /** 
   * a标签、媒体标签转换相对地址
   * @param articleContent node节点
  */
  _fixRelativeUris(articleContent) {
    let baseURI = this._doc.baseURI
    let documentURI = this._doc.documentURI
    function toAbsoluteURI(uri) {
      if (baseURI == documentURI && uri.charAt(0) == "#") {
        return uri
      }

      try {
        return new URL(uri, baseURI).href
      } catch (ex) {
      }
      return uri
    }

    let links = getAllNodesWithTag(articleContent, ["a"])
    this._forEachNode(links, function (link) {
      let href = link.getAttribute("href")
      if (href) {
        // 删除无效跳转地址
        if (href.indexOf("javascript:") === 0) {
          // 如果链接只包含简单的文本内容，则可以将其转换为文本节点 
          if (link.childNodes.length === 1 && link.childNodes[0].nodeType === TEXT_NODE) {
            let text = this._doc.createTextNode(link.textContent)
            link.parentNode.replaceChild(text, link)
          } else {
            // 如果链接有多个子元素，那么它们都应该被保留 
            let container = this._doc.createElement("span")
            while (link.firstChild) {
              container.appendChild(link.firstChild)
            }
            link.parentNode.replaceChild(container, link)
          }
        } else {
          link.setAttribute("href", toAbsoluteURI(href)); // 转换绝对地址
        }
      }
    })

    let medias = getAllNodesWithTag(articleContent, [
      "img", "picture", "figure", "video", "audio", "source"
    ])

    this._forEachNode(medias, function (media) {
      let src = media.getAttribute("src")
      let poster = media.getAttribute("poster")
      let srcset = media.getAttribute("srcset")

      if (src) {
        media.setAttribute("src", toAbsoluteURI(src))
      }

      if (poster) {
        media.setAttribute("poster", toAbsoluteURI(poster))
      }

      if (srcset) { // 多图像源
        let newSrcset = srcset.replace(REGEXPS.srcsetUrl, function (_, p1, p2, p3) {
          return toAbsoluteURI(p1) + (p2 || "") + p3
        })

        media.setAttribute("srcset", newSrcset)
      }
    })
  }

  /** 
   * 删除dom树中的空白节点，如果只有一个节点，就替换掉
   * @param articleContent node节点
  */
  _simplifyNestedElements(articleContent) {
    let node = articleContent

    while (node) {
      if (node.parentNode && ["DIV", "SECTION"].includes(node.tagName) && !(node.id && node.id.startsWith("readability"))) {
        if (this._isElementWithoutContent(node)) {
          node = removeAndGetNext(node)
          continue
        } else if (this._hasSingleTagInsideElement(node, "DIV") || this._hasSingleTagInsideElement(node, "SECTION")) {
          // 如果只有一个就替换掉
          let child = node.children[0]
          for (let i = 0; i < node.attributes.length; i++) {
            child.setAttribute(node.attributes[i].name, node.attributes[i].value)
          }
          node.parentNode.replaceChild(child, node)
          node = child
          continue
        }
      }

      node = getNextNode(node)
    }
  }

  /**
   * 找到文章标题
   * @return string
   **/
  _getArticleTitle() {
    let doc = this._doc
    let h1List = []
    this._forEachNode(doc.querySelectorAll('h1'), function (node) {
      const innerText = node.textContent.trim()
      if (innerText.length < 50) {
        h1List.push(node.textContent.trim())
      }
    })
    let maybeTitle = [
      doc.title.trim(),
      ...h1List,
      doc.querySelector('.title')?.textContent.trim(),
      doc.querySelector('#title')?.textContent.trim(),
      doc.querySelector('h2')?.textContent.trim()
    ]
      .filter(t => t)
      .map(t => {
        // 处理\n、处理标题中的分隔符
        return t.split(/\n/)[0].split(/(?<=[^\d])[\|\-](?=[^\d])/).sort((a, b) => b.length - a.length)[0]
      })
      .sort((a, b) => b.length - a.length)[0] // 较长的优先级更高一些

    // 处理多个空白符 
    const curTitle = (maybeTitle || "").trim().replace(REGEXPS.normalize, " ")

    // TODO 这里还可以考虑一下选出来的标题是否匹配，如果不匹配的话，就重新选一个

    return curTitle
  }

  /**
   * 删除 style 标签
   * 替换 body 里的连续 br 标签为独立的 p 标签
   * 把 font 标签全部替换为 span，包括标签属性
   */
  _prepDocument() {
    let doc = this._doc

    this._removeNodes(getAllNodesWithTag(doc, ["style"]))

    if (doc.body) {
      this._replaceBrs(doc.body)
    }

    this._replaceNodeTags(getAllNodesWithTag(doc, ["font"]), "SPAN")
  }

  /** 查找下一个 nextSibling 如果 传入的节点是elementNode 则直接返回*/
  _nextNode(node) {
    let next = node
    while (next
      && (next.nodeType != ELEMENT_NODE)
      && REGEXPS.whitespace.test(next.textContent)) {
      next = next.nextSibling
    }
    return next
  }

  /** 用一个<p>替换2个或更多连续<br>元素 */
  _replaceBrs(elem) {
    this._forEachNode(getAllNodesWithTag(elem, ["br"]), function (br) {
      let next = br.nextSibling

      /** 是否已经找到并替换的标记 */
      let replaced = false

      // 把连续br后面的br删除 一会用p代替
      while ((next = this._nextNode(next)) && (next.tagName == "BR")) {
        replaced = true
        let brSibling = next.nextSibling
        next.parentNode.removeChild(next)
        next = brSibling
      }

      if (replaced) {
        let p = this._doc.createElement("p")
        br.parentNode.replaceChild(p, br)

        next = p.nextSibling
        while (next) {
          // 如果碰到了另一个<br><br>，就算完成了向这个<p>添加子元素。 
          if (next.tagName == "BR") {
            let nextElem = this._nextNode(next.nextSibling)
            if (nextElem && nextElem.tagName == "BR") break
          }

          if (!this._isPhrasingContent(next)) break

          // 用p标签添加
          let sibling = next.nextSibling
          p.appendChild(next)
          next = sibling
        }

        while (p.lastChild && this._isWhitespace(p.lastChild)) {
          p.removeChild(p.lastChild)
        }

        if (p.parentNode.tagName === "P") setNodeTag(p.parentNode, "DIV")
      }
    })
  }

  /**  删除内联样式，iframe，表单，剥离无关的p标签等操作  */
  _prepArticle(articleContent) {

    cleanStyles(articleContent)

    this._markDataTables(articleContent)

    this._fixLazyImages(articleContent)

    // 删除文章中的垃圾内容
    this._cleanConditionally(articleContent, "form")
    this._cleanConditionally(articleContent, "fieldset")
    this._clean(articleContent, "object")
    this._clean(articleContent, "embed")
    this._clean(articleContent, "footer")
    this._clean(articleContent, "link")
    this._clean(articleContent, "aside")

    // 删除最佳节点中带有分享属性的节点
    let shareElementThreshold = DEFAULT_CHAR_THRESHOLD

    this._forEachNode(articleContent.children, function (topCandidate) {
      this._cleanMatchedNodes(topCandidate, function (node, matchString) {
        return REGEXPS.shareElements.test(matchString) && node.textContent.length < shareElementThreshold
      })
    })

    this._clean(articleContent, "iframe")
    this._clean(articleContent, "input")
    this._clean(articleContent, "textarea")
    this._clean(articleContent, "select")
    this._clean(articleContent, "button")
    this._cleanHeaders(articleContent)

    this._cleanConditionally(articleContent, "table")
    this._cleanConditionally(articleContent, "ul")
    this._cleanConditionally(articleContent, "div")

    // h1 替换成 h2
    this._replaceNodeTags(getAllNodesWithTag(articleContent, ["h1"]), "h2")

    // 删除多余段落
    this._removeNodes(getAllNodesWithTag(articleContent, ["p"]), function (paragraph) {
      let imgCount = paragraph.getElementsByTagName("img").length
      let embedCount = paragraph.getElementsByTagName("embed").length
      let objectCount = paragraph.getElementsByTagName("object").length
      let iframeCount = paragraph.getElementsByTagName("iframe").length
      let totalCount = imgCount + embedCount + objectCount + iframeCount

      return totalCount === 0 && !getInnerText(paragraph, false)
    })

    this._forEachNode(getAllNodesWithTag(articleContent, ["br"]), function (br) {
      let next = this._nextNode(br.nextSibling)
      if (next && next.tagName == "P") {
        br.parentNode.removeChild(br)
      }
    })

    // 删除多余的表格
    this._forEachNode(getAllNodesWithTag(articleContent, ["table"]), function (table) {
      let tbody = this._hasSingleTagInsideElement(table, "TBODY") ? table.firstElementChild : table
      if (this._hasSingleTagInsideElement(tbody, "TR")) {
        let row = tbody.firstElementChild
        if (this._hasSingleTagInsideElement(row, "TD")) {
          let cell = row.firstElementChild
          cell = setNodeTag(cell, this._everyNode(cell.childNodes, this._isPhrasingContent) ? "P" : "DIV")
          table.parentNode.replaceChild(cell, table)
        }
      }
    })
  }

  /** 初始化一个节点并计算其class\id的权重 */
  _initializeNode(node) {
    node.readability = { contentScore: 0 }

    switch (node.tagName) {
      case 'ARTICLE':
        node.readability.contentScore += 10
        break

      case 'SECTION':
        node.readability.contentScore += 8
        break

      case "DIV":
        node.readability.contentScore += 5
        break

      case "PRE":
      case "TD":
      case "BLOCKQUOTE":
        node.readability.contentScore += 3
        break

      case "ADDRESS":
      case "OL":
      case "UL":
      case "DL":
      case "DD":
      case "DT":
      case "LI":
      case "FORM":
        node.readability.contentScore -= 3
        break

      case "H1":
      case "H2":
      case "H3":
      case "H4":
      case "H5":
      case "H6":
      case "TH":
        node.readability.contentScore -= 5
        break
    }

    node.readability.contentScore += this._getClassWeight(node)
  }

  _checkPublishTime(node, matchString) {
    if (this._articleTime) {
      return false
    }

    if ((node.nodeName === 'TIME' || REGEXPS.pubilshTime.test(matchString)) && isValidTime(node.textContent)) {
      // 处理冒号
      let time = handleColons(node.textContent.trim())
      // 处理多余的文字
      this._articleTime = time.replace(/(?:^.[^\d]+)|(?:.[^\d]+$)/g, "")

      return true
    }
    return false
  }

  _checkAuthor(node, matchString) {
    if (this._articleAuthor) {
      return false
    }
    let rel, itemprop
    if (node.getAttribute !== undefined) {
      rel = node.getAttribute("rel")
      itemprop = node.getAttribute("itemprop")
    }

    if ((rel === "author" || (itemprop && itemprop.indexOf("author") !== -1) || REGEXPS.author.test(matchString)) && isValidAuthor(node.textContent)) {
      // 处理冒号
      this._articleAuthor = handleColons(node.textContent.trim())
      return true
    }
    return false
  }

  _getNodeAncestors(node, maxDepth) {
    maxDepth = maxDepth || 0
    let i = 0, ancestors = []
    while (node.parentNode) {
      ancestors.push(node.parentNode)
      if (maxDepth && ++i === maxDepth) break
      node = node.parentNode
    }
    return ancestors
  }

  /** 使用各种指标(内容得分，类名，元素类型)，寻找最合适的内容，返回div元素。 page是一个document.body */
  _grabArticle(page) {
    this.log("**** grabArticle ****")
    let doc = this._doc
    let isPaging = page !== null; // true
    page = page ? page : this._doc.body

    if (!page) {
      this.log("No body found in document. Abort.")
      return null
    }
    // 保存一下现在的html
    let pageCacheHtml = page.innerHTML

    while (true) {
      this.log("Starting grabArticle loop")
      let stripUnlikelyCandidates = this._flagIsActive(this.FLAG_STRIP_UNLIKELYS); // 每次大循环检查一下是否还有不可能标记

      // 准备节点。删除不靠谱的节点(比如类名为“comment”的节点)，并将使用不当的div转换为P标签(例如，它们不包含其他块级元素)。 
      let elementsToScore = []
      let node = this._doc.documentElement
      let shouldRemoveTitleHeader = true

      while (node) { // 遍历 node

        let matchString = node.className + " " + node.id

        // 删除隐藏的节点
        if (!isProbablyVisible(node)) {
          this.log("Removing hidden node - " + matchString)
          node = removeAndGetNext(node)
          continue
        }

        // 删除bootstrap的模态框，bootstrap中用户不能同时看到“aria-modal = true”和“role = dialog”的元素；
        if (node.getAttribute("aria-modal") == "true" && node.getAttribute("role") == "dialog") {
          node = removeAndGetNext(node)
          continue
        }

        // 删除作者节点
        if (this._checkAuthor(node, matchString)) {
          node = removeAndGetNext(node)
          continue
        }

        // 删除时间节点
        if (this._checkPublishTime(node, matchString)) {
          node = removeAndGetNext(node)
          continue
        }

        // 删除看起来像标题的节点
        if (shouldRemoveTitleHeader && this._headerDuplicatesTitle(node)) {
          this.log("Removing header: ", node.textContent.trim(), this._articleTitle.trim())
          shouldRemoveTitleHeader = false
          node = removeAndGetNext(node)
          continue
        }

        // 删除我认为不太可能是内容的节点
        if (stripUnlikelyCandidates) {
          if (REGEXPS.unlikelyCandidates.test(matchString) && // 包含不可能的class 和 id
            !REGEXPS.okMaybeItsACandidate.test(matchString) && // 不包含可能的class 和 id
            !hasAncestorTag(node, "table") && // node节点向上三级以内没有 table
            !hasAncestorTag(node, "code") && // node节点向上三级以内没有 code
            node.tagName !== "BODY" &&  // node 不是 body
            node.tagName !== "A") {  // node 不是 a
            this.log("Removing unlikely candidate - " + matchString)
            node = removeAndGetNext(node)
            continue
          }

          // 删除包含指定role属性的节点
          if (UNLIKELY_ROLES.includes(node.getAttribute("role"))) {
            this.log("Removing content with role " + node.getAttribute("role") + " - " + matchString)
            node = removeAndGetNext(node)
            continue
          }
        }

        // 删除一些特定标签的空标签
        if ((node.tagName === "DIV" || node.tagName === "SECTION" || node.tagName === "HEADER" ||
          node.tagName === "H1" || node.tagName === "H2" || node.tagName === "H3" ||
          node.tagName === "H4" || node.tagName === "H5" || node.tagName === "H6") &&
          this._isElementWithoutContent(node)) {
          node = removeAndGetNext(node)
          continue
        }

        // 删除完节点，把符合要求的节点加入到计分数组中
        if (DEFAULT_TAGS_TO_SCORE.indexOf(node.tagName) !== -1) {
          elementsToScore.push(node)
        }

        // 如果div下没有其他的块级元素。就把div转换为p
        if (node.tagName === "DIV") {
          let p = null
          let childNode = node.firstChild
          while (childNode) { // 转P标签
            let nextSibling = childNode.nextSibling
            if (this._isPhrasingContent(childNode)) { // 是短语内容标签
              if (p !== null) {
                p.appendChild(childNode)
              } else if (!this._isWhitespace(childNode)) { // 不是空白内容标签
                p = doc.createElement("p")
                node.replaceChild(p, childNode)
                p.appendChild(childNode)
              }
            } else if (p !== null) {
              while (p.lastChild && this._isWhitespace(p.lastChild)) { // 删除空白标签
                p.removeChild(p.lastChild)
              }
              p = null
            }
            childNode = nextSibling
          }

          // 如果最后div下只有一个P标签，并且链接密度小于0.25(代表纯文本较多)，直接把p标签提上来代替div
          if (this._hasSingleTagInsideElement(node, "P") && this._getLinkDensity(node) < 0.25) {
            let newNode = node.children[0]
            node.parentNode.replaceChild(newNode, node)
            node = newNode
            elementsToScore.push(node)
          } else if (!this._hasChildBlockElement(node)) { // 如果没有块级元素，也直接替换成p
            node = setNodeTag(node, "P")
            elementsToScore.push(node)
          }
        }
        node = getNextNode(node)
      }

      // 循环所有靠谱节点进行计分,向上五层祖先节点全部算在计分范围内
      let candidates = []
      this._forEachNode(elementsToScore, function (elementToScore) {
        if (!elementToScore.parentNode || typeof (elementToScore.parentNode.tagName) === "undefined") return

        // 少于25个字的节点不要
        let innerText = getInnerText(elementToScore)
        if (innerText.length < 25) return

        // 向上获取五层祖先节点
        let ancestors = this._getNodeAncestors(elementToScore, 5)
        if (ancestors.length === 0) return

        let contentScore = 0

        // 段落本身 +1 分
        contentScore += 1

        // 一个逗号 +1 分
        // contentScore += innerText.split(REGEXPS.punctuation).length
        contentScore += innerText.split("，").length

        // 每一百个字 +1 分, 最多 +3 分
        contentScore += Math.min(Math.floor(innerText.length / 100), 3)

        // 初始化node, 给祖先节点评分
        this._forEachNode(ancestors, function (ancestor, level) {
          if (!ancestor.tagName || !ancestor.parentNode || typeof (ancestor.parentNode.tagName) === "undefined") return

          if (typeof (ancestor.readability) === "undefined") {
            this._initializeNode(ancestor); // 初始化 并进行一系列打分操作
            candidates.push(ancestor)
          }

          // 距离当前节点越远，分数越底
          // 比例为：父节点 1 、祖父节点 2 、其他节点为层级 * 3
          let scoreDivider
          if (level === 0) {
            scoreDivider = 1
          } else if (level === 1) {
            scoreDivider = 2
          } else {
            scoreDivider = level * 3
          }
          ancestor.readability.contentScore += contentScore / scoreDivider
        })
      })

      // 按照得分寻找多个最佳节点
      let topCandidates = []
      for (let c = 0, cl = candidates.length; c < cl; c += 1) {
        let candidate = candidates[c]

        // 更好的内容的链接密度应该要小于5%
        let candidateScore = candidate.readability.contentScore * (1 - this._getLinkDensity(candidate))
        candidate.readability.contentScore = candidateScore

        this.log("Candidate:", candidate, "with score " + candidateScore)

        for (let t = 0; t < this._nbTopCandidates; t++) { // 只选择指定的候选人数量，选出分最高的
          let aTopCandidate = topCandidates[t]

          if (!aTopCandidate || candidateScore > aTopCandidate.readability.contentScore) {
            topCandidates.splice(t, 0, candidate)
            if (topCandidates.length > this._nbTopCandidates) {
              topCandidates.pop()
            }
            break
          }
        }
      }

      let topCandidate = topCandidates[0] || null
      /** 标记是否是创建的顶级候选人 */
      let neededToCreateTopCandidate = false
      let parentOfTopCandidate

      // 最佳节点如果没找到，或者最佳节点是body，就把body里的所有东西都搞到topCandidate里。
      if (topCandidate === null || topCandidate.tagName === "BODY") {
        topCandidate = doc.createElement("DIV")
        neededToCreateTopCandidate = true
        while (page.firstChild) {
          this.log("Moving child out:", page.firstChild)
          topCandidate.appendChild(page.firstChild)
        }
        page.appendChild(topCandidate)
        // 重新计算权重
        this._initializeNode(topCandidate)
      } else if (topCandidate) {
        // 在topCandidates里找到跟最佳节点分数相近的节点
        let alternativeCandidateAncestors = []
        for (let i = 1; i < topCandidates.length; i++) {
          if (topCandidates[i].readability.contentScore / topCandidate.readability.contentScore >= 0.75) {
            alternativeCandidateAncestors.push(this._getNodeAncestors(topCandidates[i]))
          }
        }
        // 向上找到满足条件的节点超过三个（1个2个没有对比的必要），看看他们的祖先节点数组是否包含最佳节点，把最佳节点重置
        let MINIMUM_TOPCANDIDATES = 3
        if (alternativeCandidateAncestors.length >= MINIMUM_TOPCANDIDATES) {
          parentOfTopCandidate = topCandidate.parentNode
          while (parentOfTopCandidate.tagName !== "BODY") {
            let listsContainingThisAncestor = 0
            for (let ancestorIndex = 0; ancestorIndex < alternativeCandidateAncestors.length && listsContainingThisAncestor < MINIMUM_TOPCANDIDATES; ancestorIndex++) {
              listsContainingThisAncestor += Number(alternativeCandidateAncestors[ancestorIndex].includes(parentOfTopCandidate))
            }
            if (listsContainingThisAncestor >= MINIMUM_TOPCANDIDATES) {
              topCandidate = parentOfTopCandidate
              break
            }
            parentOfTopCandidate = parentOfTopCandidate.parentNode
          }
        }
        if (!topCandidate.readability) {
          this._initializeNode(topCandidate)
        }

        // 贪心策略，继续尝试获取更高层的dom. 找一下更高层有没有计算过分数的节点
        parentOfTopCandidate = topCandidate.parentNode
        let lastScore = topCandidate.readability.contentScore
        let scoreThreshold = lastScore / 3
        while (parentOfTopCandidate.tagName !== "BODY") {
          if (!parentOfTopCandidate.readability) { // 靠谱节点向上五个祖先节点都被评过分
            parentOfTopCandidate = parentOfTopCandidate.parentNode
            continue
          }
          let parentScore = parentOfTopCandidate.readability.contentScore
          if (parentScore < scoreThreshold) break
          if (parentScore > lastScore) {
            topCandidate = parentOfTopCandidate
            break
          }
          lastScore = parentOfTopCandidate.readability.contentScore
          parentOfTopCandidate = parentOfTopCandidate.parentNode
        }

        // 贪心策略，继续尝试获取更高层的dom. 如果当前最佳节点是独立节点，把它的父节点作为最佳节点
        parentOfTopCandidate = topCandidate.parentNode
        while (parentOfTopCandidate.tagName != "BODY" && parentOfTopCandidate.children.length == 1) {
          topCandidate = parentOfTopCandidate
          parentOfTopCandidate = topCandidate.parentNode
        }
        if (!topCandidate.readability) {
          this._initializeNode(topCandidate)
        }
      }

      // 贪心策略，继续尝试在最佳节点的兄弟节点中找到更好的节点
      let articleContent = doc.createElement("DIV")
      if (isPaging) {
        articleContent.id = "readability-content"
      }

      let siblingScoreThreshold = Math.max(10, topCandidate.readability.contentScore * 0.2)
      // 保留最佳节点的父节点，一会有用
      parentOfTopCandidate = topCandidate.parentNode
      let siblings = parentOfTopCandidate.children

      for (let s = 0, sl = siblings.length; s < sl; s++) {
        let sibling = siblings[s]
        let append = false

        this.log("Looking at sibling node:", sibling, sibling.readability ? ("with score " + sibling.readability.contentScore) : "")
        this.log("Sibling has score", sibling.readability ? sibling.readability.contentScore : "Unknown")

        if (sibling === topCandidate) {
          append = true
        } else {
          let contentBonus = 0

          // class 类名相同，就需要添加额外的分数
          if (sibling.className === topCandidate.className && topCandidate.className !== "") {
            contentBonus += topCandidate.readability.contentScore * 0.2
          }
          // 分数更高的话就替换为最佳节点
          if (sibling.readability && ((sibling.readability.contentScore + contentBonus) >= siblingScoreThreshold)) {
            append = true
          } else if (sibling.nodeName === "P") {
            let linkDensity = this._getLinkDensity(sibling)
            let nodeContent = getInnerText(sibling)
            let nodeLength = nodeContent.length

            if (nodeLength > 80 && linkDensity < 0.25) {
              append = true
            } else if (nodeLength < 80 && nodeLength > 0 && linkDensity === 0 && nodeContent.search(/。( |$)/) !== -1) { // 句号结尾
              append = true
            }
          }
        }

        // 当前兄弟节点是更好的节点，且它不是常见块级元素的话，改成div
        if (append) {
          this.log("Appending node:", sibling)
          if (ALTER_TO_DIV_EXCEPTIONS.indexOf(sibling.nodeName) === -1) {
            this.log("Altering sibling:", sibling, "to div.")
            sibling = setNodeTag(sibling, "DIV")
          }

          articleContent.appendChild(sibling)
          // appendChild 之后 重新获取一下所有的兄弟节点
          siblings = parentOfTopCandidate.children
          // appendChild 之后 长度少了一个，需要 -1
          s -= 1
          sl -= 1
        }
      }

      this.log("Article content pre-prep: " + articleContent.innerHTML)

      // 搞到最佳节点之后，开始清理节点
      this._prepArticle(articleContent)

      this.log("Article content post-prep: " + articleContent.innerHTML)

      // 处理成带 page 的类型
      if (neededToCreateTopCandidate) {
        // 前面创建的最佳节点，没有兄弟节点，直接更换类名即可
        topCandidate.id = "readability-page-1"
        topCandidate.className = "page"
      } else {
        let div = doc.createElement("DIV")
        div.id = "readability-page-1"
        div.className = "page"
        while (articleContent.firstChild) {
          div.appendChild(articleContent.firstChild)
        }
        articleContent.appendChild(div)
      }

      this.log("Article content after paging: " + articleContent.innerHTML)

      let parseSuccessful = true

      // 完成算法之后需要判断我们是否得到了有用的内容  如果没有得到，就需要进入下次循环 重新找
      let textLength = getInnerText(articleContent, true).length
      if (textLength < this._charThreshold) {
        parseSuccessful = false
        page.innerHTML = pageCacheHtml

        if (this._flagIsActive(this.FLAG_STRIP_UNLIKELYS)) {
          this._removeFlag(this.FLAG_STRIP_UNLIKELYS)
          this._attempts.push({ articleContent: articleContent, textLength: textLength })
        } else if (this._flagIsActive(this.FLAG_WEIGHT_CLASSES)) {
          this._removeFlag(this.FLAG_WEIGHT_CLASSES)
          this._attempts.push({ articleContent: articleContent, textLength: textLength })
        } else if (this._flagIsActive(this.FLAG_CLEAN_CONDITIONALLY)) {
          this._removeFlag(this.FLAG_CLEAN_CONDITIONALLY)
          this._attempts.push({ articleContent: articleContent, textLength: textLength })
        } else {
          this._attempts.push({ articleContent: articleContent, textLength: textLength })
          // 找一下最长的那段文本
          this._attempts.sort(function (a, b) {
            return b.textLength - a.textLength
          })

          // 没东西 就直接跳出循环了
          if (!this._attempts[0].textLength) {
            return null
          }

          articleContent = this._attempts[0].articleContent
          parseSuccessful = true
        }
      }

      if (parseSuccessful) { // 成功之后跳出循环
        return articleContent
      }
    }
  }

  /** 获取文章的元数据 */
  _getArticleMetadata() {
    let metadata = {}
    let values = {}
    let metaElements = this._doc.getElementsByTagName("meta")

    // 从 meta标签 里面找描述
    this._forEachNode(metaElements, function (element) {
      let elementName = element.getAttribute("name")
      let elementProperty = element.getAttribute("property")
      let content = element.getAttribute("content")
      if (!content) {
        return
      }
      let matches = null
      let name = null

      if (elementProperty) {
        matches = elementProperty.match(REGEXPS.propertyPattern)
        if (matches) {
          name = matches[0].toLowerCase().replace(/\s/g, "")
          values[name] = content.trim()
        }
      }
      if (!matches && elementName && REGEXPS.namePattern.test(elementName)) {
        name = elementName
        if (content) {
          // 转换为小写，删除任何空白，并将点转换为冒号，方便一会匹配。
          name = name.toLowerCase().replace(/\s/g, "").replace(/\./g, ":")
          values[name] = content.trim()
        }
      }
    })

    // 标题
    metadata.title = values["dc:title"] ||
      values["dcterm:title"] ||
      values["og:title"] ||
      values["weibo:article:title"] ||
      values["weibo:webpage:title"] ||
      values["title"] ||
      values["twitter:title"]

    if (!metadata.title) {
      metadata.title = this._getArticleTitle()
    }

    // 作者
    metadata.author = values["dc:creator"] ||
      values["dcterm:creator"] ||
      values["author"]

    // 描述
    metadata.excerpt = values["dc:description"] ||
      values["dcterm:description"] ||
      values["og:description"] ||
      values["weibo:article:description"] ||
      values["weibo:webpage:description"] ||
      values["description"] ||
      values["twitter:description"]

    // 进行html实体转换
    metadata.title = unescapeHtmlEntities(metadata.title)
    metadata.author = unescapeHtmlEntities(metadata.author)
    metadata.excerpt = unescapeHtmlEntities(metadata.excerpt)

    return metadata
  }

  /** 从 doc 中删除 script、noscript 标签 */
  _removeScripts(doc) {
    this._removeNodes(getAllNodesWithTag(doc, ["script", "noscript"]))
  }

  /** 检查element是否只有一个指定标签 */
  _hasSingleTagInsideElement(element, tag) {
    if (element.children.length != 1 || element.children[0].tagName !== tag) {
      return false
    }

    // 检查element是否有实际的内容
    return !this._someNode(element.childNodes, function (node) {
      return node.nodeType === TEXT_NODE &&
        REGEXPS.hasContent.test(node.textContent)
    })
  }

  _isElementWithoutContent(node) {
    return node.nodeType === ELEMENT_NODE &&
      node.textContent.trim().length == 0 &&
      (node.children.length == 0 ||
        node.children.length == node.getElementsByTagName("br").length + node.getElementsByTagName("hr").length)
  }

  /** 确定元素是否有子块级元素。  */
  _hasChildBlockElement(element) {
    return this._someNode(element.childNodes, function (node) {
      return DIV_TO_P_ELEMS.has(node.tagName) || this._hasChildBlockElement(node)
    })
  }

  /** 判断节点是不是短语内容 phrasing content. */
  _isPhrasingContent(node) {
    return node.nodeType === TEXT_NODE || PHRASING_ELEMS.indexOf(node.tagName) !== -1 ||
      ((node.tagName === "A" || node.tagName === "DEL" || node.tagName === "INS") && this._everyNode(node.childNodes, this._isPhrasingContent))
  }

  _isWhitespace(node) {
    return (node.nodeType === TEXT_NODE && node.textContent.trim().length === 0) ||
      (node.nodeType === ELEMENT_NODE && node.tagName === "BR")
  }

  /** 获取链接密度占内容的百分比；链接内的文本量除以节点中的文本总数。  */
  _getLinkDensity(element) {
    let textLength = getInnerText(element).length
    if (textLength === 0)
      return 0

    let linkLength = 0

    // XXX implement _reduceNodeList?
    this._forEachNode(element.getElementsByTagName("a"), function (linkNode) {
      let href = linkNode.getAttribute("href")
      let coefficient = href && REGEXPS.hashUrl.test(href) ? 0.3 : 1; // 锚点链接的系数要低一些
      linkLength += getInnerText(linkNode).length * coefficient
    })

    return linkLength / textLength
  }

  /** 计算一下class 和 id的权重，看起来更靠谱的权重就更高 */
  _getClassWeight(e) {
    if (!this._flagIsActive(this.FLAG_WEIGHT_CLASSES))
      return 0

    let weight = 0

    // 给 class 打分
    if (typeof (e.className) === "string" && e.className !== "") {
      if (REGEXPS.negative.test(e.className)) {
        // 导航 -25
        weight -= 25
      }

      if (REGEXPS.positive.test(e.className)) {
        // 很靠谱的 +25
        weight += 25
      }
    }

    // 给 id 打分
    if (typeof (e.id) === "string" && e.id !== "") {
      if (REGEXPS.negative.test(e.id)) {
        weight -= 25
      }

      if (REGEXPS.positive.test(e.id)) {
        weight += 25
      }
    }

    return weight
  }

  /** 删除所有tag节点 */
  _clean(e, tag) {
    let isEmbed = ["object", "embed", "iframe"].indexOf(tag) !== -1

    this._removeNodes(getAllNodesWithTag(e, [tag]), function (element) {
      // 对于嵌入标签，允许视频通过
      if (isEmbed) {
        for (let i = 0; i < element.attributes.length; i++) {
          if (this._allowedVideoRegex.test(element.attributes[i].value)) {
            return false
          }
        }

        if (element.tagName === "object" && this._allowedVideoRegex.test(element.innerHTML)) {
          return false
        }
      }

      return true
    })
  }

  /** 获取表格的行和列的数量 @return Object */
  _getRowAndColumnCount(table) {
    let rows = 0
    let columns = 0
    let trs = table.getElementsByTagName("tr")
    for (let i = 0; i < trs.length; i++) {
      let rowspan = trs[i].getAttribute("rowspan") || 0
      if (rowspan) {
        rowspan = parseInt(rowspan, 10)
      }
      rows += (rowspan || 1)

      // 处理列数量
      let columnsInThisRow = 0
      let cells = trs[i].getElementsByTagName("td")
      for (let j = 0; j < cells.length; j++) {
        let colspan = cells[j].getAttribute("colspan") || 0
        if (colspan) {
          colspan = parseInt(colspan, 10)
        }
        columnsInThisRow += (colspan || 1)
      }
      columns = Math.max(columns, columnsInThisRow)
    }
    return { rows: rows, columns: columns }
  }

  /** 标记找到数据表格，而不是布局表格。*/
  _markDataTables(root) {
    let tables = root.getElementsByTagName("table")
    for (let i = 0; i < tables.length; i++) {
      let table = tables[i]
      let role = table.getAttribute("role")
      if (role == "presentation") {
        table._readabilityDataTable = false
        continue
      }
      let datatable = table.getAttribute("datatable")
      if (datatable == "0") {
        table._readabilityDataTable = false
        continue
      }
      let summary = table.getAttribute("summary")
      if (summary) {
        table._readabilityDataTable = true
        continue
      }

      let caption = table.getElementsByTagName("caption")[0]
      if (caption && caption.childNodes.length > 0) {
        table._readabilityDataTable = true
        continue
      }

      // 表格后代中有任意一个下述标签，就认为是数据表格
      let dataTableDescendants = ["col", "colgroup", "tfoot", "thead", "th"]
      let descendantExists = function (tag) {
        return !!table.getElementsByTagName(tag)[0]
      }
      if (dataTableDescendants.some(descendantExists)) {
        this.log("Data table because found data-y descendant")
        table._readabilityDataTable = true
        continue
      }

      // 嵌套表格是布局表格
      if (table.getElementsByTagName("table")[0]) {
        table._readabilityDataTable = false
        continue
      }

      let sizeInfo = this._getRowAndColumnCount(table)
      if (sizeInfo.rows >= 10 || sizeInfo.columns > 4) {
        table._readabilityDataTable = true
        continue
      }
      // Now just go by size entirely:
      table._readabilityDataTable = sizeInfo.rows * sizeInfo.columns > 10
    }
  }

  /** 将具有data-src属性的图片转换为无需JS即可加载的图片  */
  _fixLazyImages(root) {
    this._forEachNode(getAllNodesWithTag(root, ["img", "picture", "figure"]), function (elem) {
      // 检查一下base64地址，排除svg
      if (elem.src && REGEXPS.b64DataUrl.test(elem.src)) {
        let parts = REGEXPS.b64DataUrl.exec(elem.src)
        if (parts[1] === "image/svg+xml") {
          return
        }

        // 如果有src以外的图片地址属性，则标记可以删除这个图片
        let srcCouldBeRemoved = false
        for (let i = 0; i < elem.attributes.length; i++) {
          let attr = elem.attributes[i]
          if (attr.name === "src") {
            continue
          }

          if (/\.(jpg|jpeg|png|webp)/i.test(attr.value)) {
            srcCouldBeRemoved = true
            break
          }
        }

        // base64 小于133字节，就可以删除了，小于133 可能是一些乱七八糟的占位符
        if (srcCouldBeRemoved) {
          let b64starts = elem.src.search(/base64\s*/i) + 7
          let b64length = elem.src.length - b64starts
          if (b64length < 133) {
            elem.removeAttribute("src")
          }
        }
      }

      // 用null来检测 https://github.com/jsdom/jsdom/issues/2580
      if ((elem.src || (elem.srcset && elem.srcset != "null")) && elem.className.toLowerCase().indexOf("lazy") === -1) {
        return
      }

      for (let j = 0; j < elem.attributes.length; j++) {
        let attr = elem.attributes[j]
        if (attr.name === "src" || attr.name === "srcset" || attr.name === "alt") {
          continue
        }
        let copyTo = null
        if (/\.(jpg|jpeg|png|webp)\s+\d/.test(attr.value)) {
          copyTo = "srcset"
        } else if (/^\s*\S+\.(jpg|jpeg|png|webp)\S*\s*$/.test(attr.value)) {
          copyTo = "src"
        }
        if (copyTo) {
          // 给img 和 picture直接设置属性
          if (elem.tagName === "IMG" || elem.tagName === "PICTURE") {
            elem.setAttribute(copyTo, attr.value)
          } else if (elem.tagName === "FIGURE" && !getAllNodesWithTag(elem, ["img", "picture"]).length) {
            // FIGURE 标签，手动加一个img给他
            let img = this._doc.createElement("img")
            img.setAttribute(copyTo, attr.value)
            elem.appendChild(img)
          }
        }
      }
    })
  }

  _getTextDensity(e, tags) {
    let textLength = getInnerText(e, true).length
    if (textLength === 0) {
      return 0
    }
    let childrenLength = 0
    let children = getAllNodesWithTag(e, tags)
    this._forEachNode(children, (child) => childrenLength += getInnerText(child, true).length)
    return childrenLength / textLength
  }

  /** 删除一些可疑的垃圾标签 */
  _cleanConditionally(e, tag) {
    if (!this._flagIsActive(this.FLAG_CLEAN_CONDITIONALLY)) return

    this._removeNodes(getAllNodesWithTag(e, [tag]), function (node) {
      // 数据表不能删除
      let isDataTable = function (t) {
        return t._readabilityDataTable
      }

      let isList = tag === "ul" || tag === "ol"
      if (!isList) {
        let listLength = 0
        let listNodes = getAllNodesWithTag(node, ["ul", "ol"])
        this._forEachNode(listNodes, (list) => listLength += getInnerText(list).length)
        isList = listLength / getInnerText(node).length > 0.9
      }

      if (tag === "table" && isDataTable(node)) {
        return false
      }

      // 检查当前node是不是在table中
      if (hasAncestorTag(node, "table", -1, isDataTable)) {
        return false
      }

      if (hasAncestorTag(node, "code")) {
        return false
      }

      let weight = this._getClassWeight(node)

      this.log("Cleaning Conditionally", node)

      let contentScore = 0;  // TODO 这里是否可以考虑一下原始分数

      if (weight + contentScore < 0) {
        return true
      }

      if (getCharCount(node, "，") < 10) {
        // 如果没有很多逗号，并且非段落元素的数量多于段落或其他不对劲的迹象，则删除该元素。 
        let p = node.getElementsByTagName("p").length
        let img = node.getElementsByTagName("img").length
        let li = node.getElementsByTagName("li").length - 100
        let input = node.getElementsByTagName("input").length
        let headingDensity = this._getTextDensity(node, ["h1", "h2", "h3", "h4", "h5", "h6"])

        let embedCount = 0
        let embeds = getAllNodesWithTag(node, ["object", "embed", "iframe"])

        for (let i = 0; i < embeds.length; i++) {
          // 不删除匹配视频网站的节点
          for (let j = 0; j < embeds[i].attributes.length; j++) {
            if (this._allowedVideoRegex.test(embeds[i].attributes[j].value)) {
              return false
            }
          }

          // object标签 检查其内部
          if (embeds[i].tagName === "object" && this._allowedVideoRegex.test(embeds[i].innerHTML)) {
            return false
          }

          embedCount++
        }

        let linkDensity = this._getLinkDensity(node)
        let contentLength = getInnerText(node).length

        let haveToRemove =
          (img > 1 && p / img < 0.5 && !hasAncestorTag(node, "figure")) ||
          (!isList && li > p) ||
          (input > Math.floor(p / 3)) ||
          (!isList && headingDensity < 0.9 && contentLength < 25 && (img === 0 || img > 2) && !hasAncestorTag(node, "figure")) ||
          (!isList && weight < 25 && linkDensity > 0.2) ||
          (weight >= 25 && linkDensity > 0.5) ||
          ((embedCount === 1 && contentLength < 75) || embedCount > 1)
        if (isList && haveToRemove) {
          for (let x = 0; x < node.children.length; x++) {
            let child = node.children[x]
            // 包含多个子元素的li
            if (child.children.length > 1) {
              return haveToRemove
            }
          }
          let li_count = node.getElementsByTagName("li").length
          // 每个li下都有img 保留
          if (img == li_count) {
            return false
          }
        }
        return haveToRemove
      }
      return false
    })
  }

  /** 删除与指定条件匹配的元素   */
  _cleanMatchedNodes(e, filter) {
    let endOfSearchMarkerNode = getNextNode(e, true)
    let next = getNextNode(e)
    while (next && next != endOfSearchMarkerNode) {
      if (filter.call(this, next, next.className + " " + next.id)) {
        next = removeAndGetNext(next)
      } else {
        next = getNextNode(next)
      }
    }
  }

  /** 移除class权重低的 h1 h2标签 */
  _cleanHeaders(e) {
    let headingNodes = getAllNodesWithTag(e, ["h1", "h2"])
    this._removeNodes(headingNodes, function (node) {
      let shouldRemove = this._getClassWeight(node) < 0
      if (shouldRemove) {
        this.log("Removing header with low class weight:", node)
      }
      return shouldRemove
    })
  }

  /** 检查该节点是内容与文章标题基本相同的H1或H2元素 */
  _headerDuplicatesTitle(node) {
    if (node.tagName != "H1" && node.tagName != "H2") {
      return false
    }
    let heading = getInnerText(node, false)
    this.log("Evaluating similarity of header:", heading, this._articleTitle)
    return textSimilarity(this._articleTitle, heading) > 0.75
  }

  _flagIsActive(flag) {
    return (this._flags & flag) > 0
  }

  _removeFlag(flag) {
    this._flags = this._flags & ~flag
  }

  /** 解析文档 */
  parse() {
    // 限制解析过大的文档，默认不限制
    if (this._maxElemsToParse > 0) {
      let numTags = this._doc.getElementsByTagName("*").length
      if (numTags > this._maxElemsToParse) {
        throw new Error("超出最大元素限制：此文档有" + numTags + "元素")
      }
    }

    // 删除 script 标签
    this._removeScripts(this._doc)

    // 删除 style 标签
    // 替换 body 里的连续 br 标签为独立的 p 标签
    // 把 font 标签全部替换为 span，包括标签属性
    this._prepDocument()

    // 获取元数据 
    // ! 针对学校页面进行一些meta标签的收集与统计
    let metadata = this._getArticleMetadata()
    this._articleTitle = metadata.title

    // 获取文章
    let articleContent = this._grabArticle()
    if (!articleContent)
      return null

    this.log("Grabbed: " + articleContent.innerHTML)

    // 转换相对地址、去除空白标签
    this._postProcessContent(articleContent)

    // 没找到文章节选的话，就用第一段
    if (!metadata.excerpt) {
      let paragraphs = articleContent.getElementsByTagName("p")
      if (paragraphs.length > 0) {
        metadata.excerpt = paragraphs[0].textContent.trim()
      }
    }

    // 清理空白符
    let textContent = cleanify(articleContent.textContent)

    return {
      title: this._articleTitle,
      author: metadata.author || this._articleAuthor,
      pubilshTime: this._articleTime,
      content: this._serializer(articleContent),
      textContent: textContent,
      length: textContent.length,
      excerpt: metadata.excerpt,
      siteName: this._articleSiteName
    }
  }
}