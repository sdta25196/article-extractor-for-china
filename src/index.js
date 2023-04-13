import Readability from './readability.js'
// import Readability from './old_readability.js'
import getHTML from './get-html.js'
import { DOMParser } from 'linkedom'
import { isString } from 'bellajs'

const run = (html, inputUrl = '') => {
  if (!isString(html)) {
    return null
  }
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const base = doc.createElement('base')
  base.setAttribute('href', inputUrl)
  doc.head.appendChild(base)
  const reader = new Readability(doc, {
    keepClasses: true,
    // debug: true
  })
  const result = reader.parse() ?? {}
  return result
  // return result.textContent ? result.content : null
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
// ! 微信公众号
// const url = 'https://mp.weixin.qq.com/s/EnaYPZi7fX0kZoPP4VVNWA'
// ! gbk 编码的
// const url = 'http://www.acac.cn/index.php?m=content&c=index&a=show&catid=41&id=4705'
// const url = 'https://gaokao.eol.cn/jiang_xi/dongtai/202212/t20221222_2262478.shtml?proId=36'
// const url = 'https://www.tsinghua.edu.cn/info/2195/94420.htm'
// const url = 'https://www.hezeu.edu.cn/info/1061/12023.htm'
// const url = 'https://www.tsinghua.edu.cn/info/1181/60298.htm'
// const url = 'https://physics.nju.edu.cn/xwgg/qnjssl/20230316/i240330.html'
// ! 阮一峰
// const url = 'https://www.ruanyifeng.com/blog/2023/04/weekly-issue-249.html'
// ! 常规
const url = 'https://news.nju.edu.cn/zhxw/20230404/i112453.html'



console.time("请求耗时")
let html = await getHTML(url)
console.timeEnd("请求耗时")
console.time("分析耗时")
// html = '<html><body><div class="article_mbx fl"><a href="/">首页</a>  - <a href="https://news.nju.edu.cn/zhxw/index.html">综合新闻</a></div></body></html>'
const c = run(html, url)
console.timeEnd("分析耗时")

console.log(c)
