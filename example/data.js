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
// ! 不符合规则，导致整个body的内容全部拿下来了
// const url = 'https://dag.wtu.edu.cn/info/1031/1273.htm'
// ! 时间拿错了
// const url = 'https://gip.csu.edu.cn/info/1112/3327.htm'
// ! 加cookie
// const url = 'https://www.zznu.edu.cn/shiyuanxinwen/Article/20234/ArticleContent_15573.html'
// const url = 'https://www.zznu.edu.cn/shiyuanxinwen/Article/20234/ArticleContent_15573.html'
// ! cookie 每次都变
// const url = 'https://sose.uestc.edu.cn/info/1004/11411.htm'
// ! 这货文章详情分页
// http://yn.people.com.cn/n2/2020/1114/c212295-34415464-2.html
// ! 真实编码写在header头里
// https://www.nvu.edu.cn/xinwenzhongxin/xueyuanxinwen/html.php?c-10483.html
// ! 真实编码写在html里
// http://yn.people.com.cn/n2/2020/1114/c212295-34415464-2.html









// 武汉纺织大学所有网站列表
let c = [

  {
    name: "武汉纺织大学新闻文化网  ",
    link: "https://news.wtu.edu.cn/"
  },
  // 机关职能部门
  {
    name: "学校办公室（主体责任办公室） ",
    link: "https://db.wtu.edu.cn/"
  },
  {
    name: "机关党委 ",
    link: "https://jgdw.wtu.edu.cn/"
  },
  {
    name: "纪委（监察专员办）综合室 ",
    link: "https://jw.wtu.edu.cn/"
  },
  {
    name: "组织部（党校） ",
    link: "https://zzb.wtu.edu.cn/"
  },
  {
    name: "宣传部（新闻中心） ",
    link: "https://xcb.wtu.edu.cn/"
  },
  {
    name: "统战部 ",
    link: "https://tzb.wtu.edu.cn/"
  },
  {
    name: "学生工作部（处）、武装部 ",
    link: "https://student.wtu.edu.cn/"
  },
  {
    name: "研究生院、研究生工作部 ",
    link: "https://gs.wtu.edu.cn/"
  },
  {
    name: "保卫部（处） ",
    link: "https://bwc.wtu.edu.cn/"
  },
  {
    name: "工会 https://g",
    link: "h.wtu.edu.cn/"
  },
  {
    name: "团委 ",
    link: "https://tw.wtu.edu.cn/"
  },
  {
    name: "发展规划处 ",
    link: "https://fgc.wtu.edu.cn/"
  },
  {
    name: "教务处（创新创业学院） ",
    link: "https://jwc.wtu.edu.cn/"
  },
  {
    name: "科学技术发展院 ",
    link: "https://kyc.wtu.edu.cn/"
  },
  {
    name: "人事处、教师工作部 ",
    link: "https://rsc.wtu.edu.cn/"
  },
  {
    name: "财务处 ",
    link: "https://cwc.wtu.edu.cn/"
  },
  {
    name: "审计处 ",
    link: "https://sjc.wtu.edu.cn/"
  },
  {
    name: "招生就业处 ",
    link: "https://zjc.wtu.edu.cn/"
  },
  {
    name: "国际交流与合作处https://gjc.wtu.edu.cn/c",
    link: "hinese.jsp"
  },
  {
    name: "资产与实验室管理处 ",
    link: "https://dpm.wtu.edu.cn/"
  },
  {
    name: "基建管理处 ",
    link: "https://jjc.wtu.edu.cn/"
  },
  {
    name: "离退休工作处、离退休党委 ",
    link: "https://lgc.wtu.edu.cn/"
  },
  {
    name: "校友工作处 https://xy",
    link: "h.wtu.edu.cn/"
  },
  {
    name: "后勤保障处 https://",
    link: "hq.wtu.edu.cn/"
  },
  // 直属、附属单位
  {
    name: "采购与招标管理中心 ",
    link: "https://zbb.wtu.edu.cn/"
  },
  {
    name: "图书馆 ",
    link: "https://lib.wtu.edu.cn/"
  },
  {
    name: "档案馆 ",
    link: "https://dag.wtu.edu.cn/"
  },
  {
    name: "信息技术中心 ",
    link: "https://etc.wtu.edu.cn/"
  },
  {
    name: "教师发展中心（教学评估中心） ",
    link: "https://cfd.wtu.edu.cn/"
  },
  {
    name: "期刊社 ",
    link: "https://qks.wtu.edu.cn/"
  },
  {
    name: "技术研究院（国家级科研平台服务中心） ",
    link: "https://tri.wtu.edu.cn/"
  },
  {
    name: "国家重点实验室 ",
    link: "https://fzcljs.wtu.edu.cn/"
  },
  {
    name: "医院 https://",
    link: "hospital.wtu.edu.cn/"
  },


  // 二级院部
  {
    name: "纺织科学与工程学院 ",
    link: "https://te.wtu.edu.cn/"
  },
  {
    name: "机械工程与自动化学院 ",
    link: "https://me.wtu.edu.cn/"
  },
  {
    name: "化学与化工学院 ",
    link: "https://ec.wtu.edu.cn/"
  },
  {
    name: "环境工程学院 https://",
    link: "hjxy.wtu.edu.cn/"
  },
  {
    name: "电子与电气工程学院 ",
    link: "https://ei.wtu.edu.cn/"
  },
  {
    name: "计算机与人工智能学院 ",
    link: "https://csai.wtu.edu.cn/"
  },
  {
    name: "数理科学学院 ",
    link: "https://slxy.wtu.edu.cn/"
  },
  {
    name: "材料科学与工程学院 ",
    link: "https://mse.wtu.edu.cn/"
  },
  {
    name: "艺术与设计学院 ",
    link: "https://art.wtu.edu.cn/"
  },
  {
    name: "服装学院",
    link: " https://fashion.wtu.edu.cn/"
  },
  {
    name: "传媒学院 ",
    link: "https://cm.wtu.edu.cn/"
  },
  {
    name: "管理学院 ",
    link: "https://em.wtu.edu.cn/"
  },
  {
    name: "会计学院 ",
    link: "https://acc.wtu.edu.cn/"
  },
  {
    name: "经济学院 ",
    link: "https://fe.wtu.edu.cn/"
  },
  {
    name: "外国语学院 ",
    link: "https://fl.wtu.edu.cn/"
  },
  {
    name: "马克思主义学院 ",
    link: "https://mks.wtu.edu.cn/"
  },
  {
    name: "伯明翰时尚创意学院 ",
    link: "https://bifca.wtu.edu.cn/"
  },
  {
    name: "体育部 ",
    link: "https://ty.wtu.edu.cn/"
  },
  {
    name: "继续教育学院 ",
    link: "https://jxjy.wtu.edu.cn/"
  },
  {
    name: "国际教育学院  ",
    link: "https://iec.wtu.edu.cn/"
  },
  // 专题网
  {
    name: "武汉纺织大学思政网  ",
    link: "https://sz.wtu.edu.cn/"
  },
  {
    name: "武汉纺织大学-学术生态建设网  ",
    link: "https://xueshu.wtu.edu.cn/"
  },
  {
    name: "武汉纺织大学人才招聘网  ",
    link: "https://sites.wtu.edu.cn/zp/"
  },
  {
    name: "欢迎访问王栋教授课题组暨湖北省先进纺织材料及应用重点实验室  ",
    link: "http://wdgroup.org/"
  },
  {
    name: "武汉纺织大学信息公开网  ",
    link: "https://xwgk.wtu.edu.cn/"
  },
  {
    name: "创新创业学院  ",
    link: "https://cyxy.wtu.edu.cn/"
  },
  {
    name: "武汉纺织大学--心理健康教育中心  ",
    link: "https://xljk.wtu.edu.cn/"
  },
  {
    name: "武汉纺织大学就业信息网  ",
    link: "https://wtu.91wllm.com/"
  },


  // 不计入网站
  {
    name: "企业决策支持研究中心资源池及网站内容管理系统  ",
    link: "https://dss.wtu.edu.cn/"
  },
  {
    name: "Home-武汉纺织大学-管理学院  ",
    link: "https://em.wtu.edu.cn/ywwz/Home.htm"
  },
  {
    name: "WUHAN TEXTILE UNIVERSITY  ",
    link: "https://english.wtu.edu.cn/"
  },
  {
    name: "纺织化学品工程技术研究中心（筹）  ",
    link: "https://tarc.wtu.edu.cn/"
  },
  {
    name: "武汉纺织大学MPAcc教育中心  ",
    link: "https://mpacc.wtu.edu.cn/"
  },
  {
    name: "湖北省数字化纺织装备重点实验室  ",
    link: "https://dtlab.wtu.edu.cn/"
  },
  {
    name: "成果申报  ",
    link: "https://gjjxcg.wtu.edu.cn/"
  },
  {
    name: "武汉纺织大学学报 ",
    link: "http://xuebao.ijournals.cn/ch/index.aspx"
  },
  {
    name: "人才招聘  ",
    link: "https://rszp.wtu.edu.cn/rsfw/sys/zpglxt/extranet/index.do#/home（外挂系统，投简历用）"
  },
  {
    name: "非线性科学研究中心 ",
    link: "https://nonlinear.wtu.edu.cn/"
  },
  {
    name: "武汉纺织大学--迎新网  ",
    link: "https://welcome.wtu.edu.cn/"
  },
  {
    name: "武汉纺织大学党史学习教育专题网  ",
    link: "https://xds.wtu.edu.cn/"
  }
]