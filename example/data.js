const data = [
  {
    "详情页是图片": [
      "https://jxjy.wtu.edu.cn/info/1037/2409.htm",
      "https://jxjy.wtu.edu.cn/info/1037/2230.htm",
      "https://www.shupl.edu.cn/jjfxy/2022/0929/c4267a115621/page.htm",
      "https://www.shupl.edu.cn/jjfxy/2022/1104/c4267a116423/page.htm",
      "https://www.whzkb.cn/#/detail?pageid=1652&typeid=5",
      "https://www.whzkb.cn/#/detail?pageid=823&typeid=5",
    ]
  },
  {
    "pdf": [
      "https://zs.jmi.edu.cn/22/89/c1702a74377/page.htm",
      "https://zs.jmi.edu.cn/3b/69/c1702a80745/page.htm",
      "https://zs.jmi.edu.cn/3b/2a/c1702a80682/page.psp",
      "https://zs.jmi.edu.cn/2c/4e/c1702a76878/page.htm",
      "https://www.gzjtxx.net/id-3055.html",
      "https://www.gzjtxx.net/id-3017.html",
      "https://www.gzjtxx.net/id-2983.html",
    ]
  },
  {
    "JS 加载": [
      "https://www.zhjpec.edu.cn/MobileContent?id=1640596535563182082",
      "https://www.zhjpec.edu.cn/MobileContent?id=1644144044979359746",
      "https://www.zhjpec.edu.cn/MobileContent?id=1639555204817911809",
      "https://www.zhjpec.edu.cn/MobileContent?id=1632554595328409602",
      "https://www.jxmtc.com/info/1041/9948.htm",
      "https://www.jxmtc.com/info/1041/9943.htm",
      "https://www.jxmtc.com/info/1041/9926.htm",
      "https://www.shjgu.edu.cn/2023/0411/c235a32886/page.htm",
      "https://www.shjgu.edu.cn/2023/0411/c235a32882/page.htm",
      "https://www.shjgu.edu.cn/2023/0403/c235a32773/page.htm",
    ]
  },
  {
    "转码版，JS加载": [
      "https://www.sdjnwx.com/articles/1171",
      "https://www.sdjnwx.com/articles/1131",
      "https://www.sdjnwx.com/articles/1109",
      "https://www.sdjnwx.com/articles/1116",
      "https://www.sdjnwx.com/articles/1168",
    ]
  },
  {
    "爬虫端滑动验证": [
      "https://www.ccdi.gov.cn/yaowenn/202304/t20230411_257982.html",
      "https://www.ccdi.gov.cn/yaowenn/202304/t20230411_258083.html",
      "https://www.ccdi.gov.cn/scdcn/sggb/zjsc/202304/t20230407_257432.html",
      "https://www.ccdi.gov.cn/yaowenn/202304/t20230406_257132.html",
      "https://www.ccdi.gov.cn/yaowenn/202304/t20230406_257026.html",
    ]
  },
  {
    "表格结构-成功": [
      "http://dlkx.hrbnu.edu.cn/info/1049/1325.htm",
      "http://dlkx.hrbnu.edu.cn/info/1049/1328.htm",
      "http://dlkx.hrbnu.edu.cn/info/1049/1481.htm",
      "http://dlkx.hrbnu.edu.cn/info/1049/1174.htm",
      "http://dlkx.hrbnu.edu.cn/info/1049/1324.htm",
      "https://huagong.sdvcst.edu.cn/info/1052/2551.htm",
      "https://huagong.sdvcst.edu.cn/info/1052/2558.htm",
      "https://huagong.sdvcst.edu.cn/info/1052/2556.htm",
      "https://huagong.sdvcst.edu.cn/info/1052/2535.htm",
      "https://huagong.sdvcst.edu.cn/info/1052/2600.htm",
    ]
  },
  {
    "gbk-成功": [
      "http://www.acac.cn/index.php?m=content&c=index&a=show&catid=41&id=4710",
      "http://www.acac.cn/index.php?m=content&c=index&a=show&catid=41&id=4692",
      "http://www.acac.cn/index.php?m=content&c=index&a=show&catid=41&id=4676",
      "http://www.acac.cn/index.php?m=content&c=index&a=show&catid=41&id=4679",
      "http://www.acac.cn/index.php?m=content&c=index&a=show&catid=41&id=4707",
    ]
  },
  {
    "其他-成功": [
      "https://rsc.sus.edu.cn/info/1070/2246.htm",
      "https://www.ynart.edu.cn/info/1003/6378.htm",
      "https://news.tongji.edu.cn/info/1003/83699.htm",
      "https://www.shupl.edu.cn/2023/0410/c3323a120336/page.htm",
      "https://union.sumhs.edu.cn/14/91/c1689a267409/page.htm",
      "http://mkszyxy.whxy.edu.cn/info/1102/2254.htm",
      "https://news.cupl.edu.cn/info/1011/37375.htm",
    ]
  }
]

// 备用
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
// const url = 'http://www.acac.cn/index.php?m=content&c=index&a=show&catid=41&id=4679'
// ! 微信公众号
// const url = 'https://mp.weixin.qq.com/s/EnaYPZi7fX0kZoPP4VVNWA'
// ! 阮一峰
// const url = 'https://www.ruanyifeng.com/blog/2023/04/weekly-issue-249.html'
// ! 常规
// const url = 'https://news.nju.edu.cn/zhxw/20230404/i112453.html'