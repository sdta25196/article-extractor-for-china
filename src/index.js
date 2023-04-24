import ParseDOC from './parse-doc.js'
import requestURL from './request-url.js'
import { DOMParser } from 'linkedom'
// import { JSDOM } from 'jsdom' 
import { isString } from 'bellajs'
import preParse from './pre-parse-doc.js'
// import { purify } from '../tools/index.js'

/** 提取文章 */
const extract = (inputHtml, baseUrl = '') => {
  if (!isString(inputHtml)) {
    throw Error("extract函数中 html 参数缺失")
  }
  // const html = purify(inputHtml)
  const html = inputHtml

  const document = new DOMParser().parseFromString(html, 'text/html')
  // ! jsdom(可以执行js) 和 linkedom(执行更快) 择机使用。
  // const { document } = (new JSDOM(html,{  contentType : "text/html" , })).window

  const base = document.createElement('base')
  base.setAttribute('href', baseUrl)
  document.head.appendChild(base)

  // 有些站点 body 他乱写。
  if (!document.body.innerHTML && document.querySelectorAll('div,p,span').length > 10) {
    document.body.innerHTML = document.documentElement.innerHTML
  }
  let bodys = document.querySelectorAll('body')
  for (let i = 1; i < bodys.length; i++) {
    let invalidBody = bodys[i]
    let div = document.createElement('div')
    div.innerHTML = invalidBody.innerHTML
    invalidBody.parentNode.replaceChild(div, invalidBody)
  }

  if (document.querySelectorAll('div,p,span').length < 10) {
    throw Error("暂不支持js渲染的页面\n或者服务器针对爬虫处理的页面")
  }

  if (
    Array.from(document.querySelectorAll('iframe')).some(x => x.src.endsWith('.pdf')) ||
    document.querySelector('*[pdfsrc]')
  ) {
    throw Error("暂不支持pdf加载的页面")
  }

  if (!preParse(document)) {
    console.log("这个文档不支持详情解析") // ! 目前这个判断不准确
  }
  const reader = new ParseDOC(document, {
    keepClasses: true,
  })
  const result = reader.parse() ?? {}
  return result
}

/**
*
* @author : 田源
* @date : 2023-04-15 17:00
* @param  urlOrHtml url或者html
* @param  baseUrl 基准url
* @return Object
*/
export default async function run(urlOrHtml, baseUrl) {
  try {
    if (!urlOrHtml) {
      throw Error("urlOrHtml 参数缺失")
    }
    let html = '', loadTime, parseTime
    // 如果url是网址 就去需要请求html
    if (urlOrHtml.startsWith('http')) {
      baseUrl = baseUrl ? baseUrl : urlOrHtml
      const startTime = Date.now()
      html = await requestURL(urlOrHtml)
      const endTime = Date.now()
      // 请求耗时
      loadTime = endTime - startTime
    } else {
      html = urlOrHtml
    }

    const startTime = Date.now()
    const article = extract(html, baseUrl)
    const endTime = Date.now()
    // 分析耗时
    parseTime = endTime - startTime
    return { ...article, loadTime, parseTime }
  } catch (err) {
    return { error: 1, message: err.toString() }
  }
}
