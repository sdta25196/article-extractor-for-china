import requestUrl from "./request-url.js"
import { DOMParser } from 'linkedom'

const REGEXPS = {
  unlikelyCandidates: /-ad-|ai2html|banner|breadcrumbs|combx|comment|community|cover-wrap|disqus|extra|footer|gdpr|header|legends|menu|related|remark|replies|rss|shoutbox|sidebar|skyscraper|social|sponsor|supplemental|ad-break|agegate|pagination|pager|popup|yom-remote/i,
  okMaybeItsACandidate: /and|article|body|column|content|main|shadow/i,
}

/**
 * 
 * 预解析页面，分析当前页面属性【文章、列表、聚合页、未知】
 * ! 对图片、pdf、文案少的详情判断会不准确
 *  
 */
async function preParse(url) {
  if (typeof url !== 'string') return {}

  let html = await requestUrl(url)

  if (!html) return {}

  // 有的网站编辑乱写标签
  html = html.replace(/<\/body>/g, '').replace(/<\/html>/g, '')

  const document = new DOMParser().parseFromString(html, 'text/html')

  if (document.querySelectorAll('div,p,span').length < 10) {
    throw Error("不支持SPA页面")
  }

  if (isJsRender(document)) {
    throw Error("不支持js渲染内容")
  }
  // 先删除 footer
  const footer = document.querySelector('.footer')
  if (footer) {
    footer.remove()
  }

  const nodes = Array.from(document.querySelectorAll('body *'))
  // 页面内容
  const contentArr = nodes.map(node => {
    if (node.tagName === 'SCRIPT') return ""
    if (node.tagName === 'STYLE') return ""
    if (node.tagName === 'OPTION') return ""
    const childNodes = []
    Array.from(node.childNodes).forEach(childNode => {
      if (childNode.nodeType === 3) {
        childNodes.push(childNode.textContent.trim())
      }
    })
    return childNodes.join("")
  }).sort((a, b) => b.length - a.length)

  // 标点数量 
  const punctuationCount = contentArr.reduce((a, b) => a + (b.match(/,|，|!|：|。|、/g)?.length || 0), 0)

  // 最大内容的长度
  const maxLength = contentArr[0].length

  // 页面上列表元素的数量
  const ulCount = document.querySelectorAll('ul,ol').length

  // ! 这三个可以优化成一个条件
  // 寻找详情页面的标识
  let maybeDetialPage = false
  // class 和 id 中寻找 page
  let havaPre = false
  let havaNext = false
  // class 和 id 包含 list 的元素
  let listElementNum = 0
  nodes.forEach(node => {
    let matchString = (node.className + " " + node.id).toLowerCase()
    // 找了一些详情页的标识
    if (!maybeDetialPage && REGEXPS.unlikelyCandidates.test(matchString) && !REGEXPS.okMaybeItsACandidate.test(matchString)) {
      maybeDetialPage = true
    }
    if (!havaPre && /pre/.test(matchString) && node.textContent.includes("页")) {
      havaPre = true
    }
    if (!havaNext && /next/.test(matchString) && node.textContent.includes("页")) {
      havaNext = true
    }
    if (/list|item/.test(matchString)) {
      listElementNum++
    }
  })

  const aTagRatio = Math.floor(document.querySelectorAll('a').length / nodes.length * 100)

  // li标签内容长度
  const liTagContent = Array.from(document.querySelectorAll('li')).filter(x => {
    return !Array.from(x.childNodes).find(z => z.tagName === 'UL')
  }).map(x => x.textContent.replace(/\s/g, '')).join("").length

  const liTagRatio = Math.floor(liTagContent / contentArr.join("").length * 100)

  // ! 概率越大，加减分越大, 列表的总分比详情的总分多5分，以此来保障列表的准确度

  // ! 列表分数
  let listScore = 0

  // if (maybeDetialPage) {
  //   listScore -= 5
  // }
  if (punctuationCount >= 20) {
    listScore -= 10
  }
  if (maxLength >= 100) {
    listScore -= 10
  }
  if (aTagRatio <= 7) {
    listScore -= 10
  }
  if (liTagRatio >= 80) {
    listScore += 20
  } else if (liTagRatio >= 50) {
    listScore += 10
  }

  if (aTagRatio >= 10) {
    listScore += 10
  }
  if (listElementNum >= 5) {
    listScore += 15
  }
  if (havaPre && havaNext) {
    listScore += 20
  }
  if (punctuationCount <= 5) {
    listScore += 5
  }
  if (ulCount >= 10 && maxLength <= 50) {
    listScore += 5
  }

  // ! 详情页分数
  let detailScore = 0

  // if (maybeDetialPage) {
  //   detailScore += 10
  // }
  if (liTagRatio > 85) {
    detailScore -= 20
  } else if (liTagRatio > 50) {
    detailScore -= 10
  }

  if (aTagRatio > 20) {
    detailScore -= 10
  }
  if (listElementNum >= 5) {
    detailScore -= 10
  }
  if (havaPre && havaNext) {
    detailScore -= 20
  }
  if (punctuationCount <= 5) {
    detailScore -= 5
  }
  if (liTagRatio < 35) {
    detailScore += 20
  }
  if (aTagRatio < 10) {
    detailScore += 5
  }
  if (punctuationCount >= 10 || (aTagRatio < 20 && ulCount <= 5 && !havaPre && !havaNext)) {
    detailScore += 20
  }
  if (ulCount <= 10) {
    detailScore += 10
  }
  if (maxLength > 200) {
    detailScore += 30
  } else if (maxLength > 70) {
    detailScore += 20
  }

  // ! 聚合页分数
  // let gatherScore = 0
  // if (punctuationCount >= 10 && listCount >= 10) {
  //   gatherScore += 10
  // }
  // if (havaPre && havaNext) {
  //   detailScore -= 20
  // }
  // if (aTagRatio >= 20) {
  //   gatherScore += 20
  // }

  // ! 没有 ul ol 元素的时候，需要判断下是不是 table组成的页面
  if (ulCount === 0 && document.querySelectorAll('body table').length > 5) {
    if (aTagRatio < 10) {
      detailScore = 40
      listScore = 0
    } else {
      listScore = 40
      detailScore = 0
    }
  }

  // ! 已知的详情页使用的 class 、id
  if (isFrame(document)) {
    detailScore = 50
    listScore = 0
  }

  let pageType = detailScore >= listScore ?
    (detailScore * 2) + '%概率是详情页' :
    (listScore * 2) + '%概率是列表页'

  return {
    maxLength,
    ulCount,
    punctuationCount,
    maybeDetialPage,
    listElementNum,
    aTagRatio,
    liTagRatio,
    pageType: pageType,
  }
}

export default preParse


/** 内容区使用的属性 */
function isFrame(document) {
  return document.querySelector("div[id^='vsb_content']") ||
    document.querySelector('.TRS_Editor') ||
    document.querySelector('.wp_articlecontent')
}

/** 判断是否是js渲染 */
function isJsRender(document) {
  // 使用 script[type="text/html"] ，并且内容有 {{ xxx }} , 就证明此页面使用的模板
  if (document.querySelector('script[type="text/html"]')?.textContent.match(/{{.[^}]+}}/)) return true
  return false
}