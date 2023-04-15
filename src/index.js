import Readability from './readability.js'
// import Readability from './old_readability.js'
import requestURL from './request-url.js'
import { DOMParser } from 'linkedom'
import { isString } from 'bellajs'

/** 提取文章 */
const extract = (html, baseUrl = '') => {
  if (!isString(html)) {
    return null
  }
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const base = doc.createElement('base')
  base.setAttribute('href', baseUrl)
  doc.head.appendChild(base)
  const reader = new Readability(doc, {
    keepClasses: true,
  })
  const result = reader.parse() ?? {}
  return result
}

// ! 文案在内置pdf中，需要搞到iframe完整的html才行 - 一般会在iframe里，获取iframe里的地址文件即可
// const url = 'https://physics.nju.edu.cn/xwgg/gg/20230404/i242037.html'
// const url = 'https://zs.jmi.edu.cn/3c/5e/c1702a80990/page.htm'
// ! 文案非常短的，默认提取不到. contentLengthThreshold 设置小一些就可以。但是会出现误差。
// ! title 中的标题不正确
// const url = 'https://xsxy.nju.edu.cn/jyjx/rcpy/20201126/i170797.html'
// ! 全是 table 的
// const url = 'https://bmf.sumhs.edu.cn/1c/98/c3460a269464/page.htm'
// ! 标题带短横杠的
// const url = 'http://dlkx.hrbnu.edu.cn/info/1049/1325.htm'

// !内容是一张图片 识别有问题！！！！ - 可以利用是否符合页面抓取来避开这类网页
// const url = 'https://www.shupl.edu.cn/jjfxy/2022/0929/c4267a115621/page.htm'
// const url = 'https://www.whzkb.cn/#/detail?pageid=1652&typeid=5'

// !内容是加密的 识别有问题！！！！！
// const url = 'https://www.jxmtc.com/info/1041/9943.htm'
// ! gbk 编码的
const url = 'http://www.acac.cn/index.php?m=content&c=index&a=show&catid=41&id=4679'
// ! 微信公众号
// const url = 'https://mp.weixin.qq.com/s/EnaYPZi7fX0kZoPP4VVNWA'
// ! 阮一峰
// const url = 'https://www.ruanyifeng.com/blog/2023/04/weekly-issue-249.html'
// ! 常规
// const url = 'https://news.nju.edu.cn/zhxw/20230404/i112453.html'


/**
*
* @author : 田源
* @date : 2023-04-15 17:00
* @param  urlOrHtml url或者html
* @param  baseUrl 基准url
*/
async function run(urlOrHtml, baseUrl) {
  if (!urlOrHtml) return null
  let html = ''
  // 如果url是网址 就去需要请求html
  if (urlOrHtml.startsWith('http')) {
    baseUrl = baseUrl ? baseUrl : urlOrHtml
    console.time("请求耗时")
    try {
      html = await requestURL(urlOrHtml)
    } catch (err) {
      console.log(err)
      return
    }
    console.timeEnd("请求耗时")
  } else {
    html = urlOrHtml
  }

  console.time("分析耗时")
  const c = extract(html, baseUrl)
  console.timeEnd("分析耗时")
  console.log(c)
}

run(url)