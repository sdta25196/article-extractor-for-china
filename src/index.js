import ParseDOC from './parse-doc.js'
import requestURL from './request-url.js'
import { DOMParser } from 'linkedom'
// import { JSDOM } from 'jsdom' 
import { isString } from 'bellajs'
import preParse from './pre-parse-doc.js'

/** 提取文章 */
const extract = (html, baseUrl = '') => {
  if (!isString(html)) {
    return {}
  }

  const document = new DOMParser().parseFromString(html, 'text/html')
  // ! jsdom(可以执行js) 和 linkedom(执行更快) 择机使用。
  // const { document } = (new JSDOM(html,{  contentType : "text/html" , })).window;

  const base = document.createElement('base')
  base.setAttribute('href', baseUrl)
  document.head.appendChild(base)

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
*/
export default async function run(urlOrHtml, baseUrl) {
  if (!urlOrHtml) return null
  let html = '', loadTime, parseTime
  // 如果url是网址 就去需要请求html
  if (urlOrHtml.startsWith('http')) {
    baseUrl = baseUrl ? baseUrl : urlOrHtml
    const startTime = Date.now()
    try {
      html = await requestURL(urlOrHtml)
    } catch (err) {
      console.log("请求异常", err)
      return { error: 1, message: err.toString() }
    }
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
}
