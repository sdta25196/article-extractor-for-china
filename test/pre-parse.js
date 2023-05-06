import preParse from "../src/pre-parse-doc.js"
import { DOMParser } from 'linkedom'

/** 提取文章 */
const extract = (html) => {
  const document = new DOMParser().parseFromString(html, 'text/html')

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
    console.log("这个文档不支持详情解析")
  } else {
    console.log("支持支持支持")
  }
}

// ! 新生学院 | 人才培养  https://xsxy.nju.edu.cn/jyjx/rcpy/20201126/i170797.html
const html = '<html lang="en" data-locator-client-url="chrome-extension://npbfdllefekhdplbkdigpncggmojpefi/client.bundle.js" data-locator-target="vscode"><head data-locator-hook-status-message="No valid renderers found.">\n    <meta charset="utf-8">\n    <meta http-equiv="X-UA-Compatible" content="IE=edge, chrome=1">\n    <meta name="renderer" content="webkit">\n    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">\n    <link rel="stylesheet" href="/DFS//template/2515/images/base.css">\n    <title>新生学院 ｜ 人才培养</title>\n    \x3Cscript type="text/javascript" src="/njdx/front/ui/jquery/jquery.js?v=v4.0.2">\x3C/script>\x3Cscript type="text/javascript" src="/njdx/front/ui/jquery/jquery.base64.js?v=v4.0.2">\x3C/script>\x3Cscript type="text/javascript" src="/njdx/front/ui/boshan/ui.js" data-appurl="/njdx">\x3C/script>\x3Cscript type="text/javascript" src="/njdx/front/ui/jquery/jquery.js">\x3C/script>\x3Cscript type="text/javascript" src="/njdx/front/ui/jquery/jquery.base64.js">\x3C/script><link type="text/css" rel="stylesheet" href="/njdx/front/ui/page/info.css?v=v4.0.2"><link type="text/css" rel="stylesheet" href="/njdx/front/ui/page/channel.css?v=v4.0.2">\x3Cscript type="text/javascript" src="/njdx/front/ui/visit/visit.js?s=146&amp;c=10403&amp;v=v4.0.2">\x3C/script>\x3Cscript type="text/javascript" src="/njdx/front/ui/jwplayer/jwplayer.js?v=v4.0.2">\x3C/script>\x3Cscript type="text/javascript" src="/njdx/front/ui/jwplayer/bs.js?v=v4.0.2">\x3C/script>\x3Cscript type="text/javascript" src="/njdx/front/ui/pdf/build/pdf.js?v=v4.0.2">\x3C/script>\x3Cscript type="text/javascript" src="/njdx/front/ui/pdf/showpdf.js?v=v4.0.2">\x3C/script>\x3Cscript type="text/javascript" src="/njdx/front/ui/layer/layer.js?v=v4.0.2">\x3C/script><link rel="stylesheet" href="https://xsxy.nju.edu.cn/njdx/front/ui/layer/skin/layer.css" id="layui_layer_skinlayercss" style="">\x3Cscript type="text/javascript" src="/njdx/front/ui/layer/bs.js?v=v4.0.2">\x3C/script>\x3Cscript type="text/javascript" src="/njdx/front/ui/template/es5-shim.min.js?v=v4.0.2">\x3C/script>\x3Cscript type="text/javascript" src="/njdx/front/ui/template/es5-sham.min.js?v=v4.0.2">\x3C/script>\x3Cscript type="text/javascript" src="/njdx/front/ui/template/template-web.js?v=v4.0.2">\x3C/script>\x3Cscript type="text/javascript" src="/njdx/front/ui/template/template-bs.js?v=v4.0.2">\x3C/script>\n    <link rel="stylesheet" href="/DFS//template/2539//images/wzy.css">\n  </head>\n\n  <body>\n\n    \x3C!-- 头部信息 -->\n    \x3Cscript src="/DFS//template/2515/images/header.js">\x3C/script><div class="g-hd">\n<div class="m-subNav warp">\n<a class="logo" href="/index.html">\n<img src="/DFS/template/2515/images/base_1.png" alt="新生学院logo">\n</a>\n<div class="search f-fr">\n<img src="/DFS/template/2515/images/base_2.png" alt="校训">\n<form action="/njdx/front/aisearch/search.do" method="get" target="_blank">\n<input type="text" name="wd" id="wd" value="">\n<input type="hidden" name="siteid" id="siteid" value="146">\n<input type="hidden" name="indexids" id="indexids" value="1">\n<input class="submit" type="submit" value="">\n</form>\n</div>\n</div>\n<div class="m-nav">\n<div class="warp">\n<div><a href="/index.html">首页</a></div>\n<div><a href="/xygk/index.html">学院概况</a></div>\n<div><a href="/dstd/index.html">新生导师</a></div>\n<div><a href="/jyjx/index.html">教育教学</a></div>\n<div><a href="/dtjs/index.html">党团建设</a></div>\n<div><a href="/sylm/syfc/index.html">书院风采</a></div>\n<div><a href="/jjxt/index.html">家校协同</a></div>\n<div><a href="/bszn/index.html">办事指南</a></div>\n</div>\n</div>\n</div>\n\n\n    <div class="g-mn warp">\n      <div class="b-channel">\n        <div class="channel"><img src="/DFS//template/2515/images/base_9.png">人才培养</div>\n        <div class="subChannel"><a href="http://xsxy.nju.edu.cn"> 首页 </a> &gt; <a href="http://xsxy.nju.edu.cn/jyjx/index.html">教育教学</a> &gt; <a href="http://xsxy.nju.edu.cn/jyjx/rcpy/index.html">人才培养</a></div>\n      </div>\n\n      <div class="m-ctx">\n        <div class="title">大类培养学科分流、专业准入实施方案一览表（2020修订版）</div>\n        <div class="control">\n          <div class="fbsj">发布时间：2020-11-26</div>\n          <div class="wzdx">字体：【<span>小</span><span>中</span><span>大</span>】</div>\n        </div>\n        <div class="content"><p><span style="font-family: 微软雅黑,Microsoft YaHei; font-size: 16px;"><br></span></p><p style="text-align: left;"><a title="大类培养分流实施方案一览表（2020修订版）" style="color: rgb(0, 102, 204); font-size: 16px; text-decoration: underline;" href="/njdx/DFS//file/2020/11/26/20201126154535360ulzs36.pdf"><span style="font-size: 16px;">大类培养分流实施方案一览表（2020修订版）</span></a></p><p><a title="大类培养分流实施方案一览表（2020修订版）" style="color: rgb(0, 102, 204); font-size: 16px; text-decoration: underline;" href="/njdx/DFS//file/2020/11/26/20201126154535360ulzs36.pdf"><span style="font-family: 微软雅黑,Microsoft YaHei; font-size: 16px;"><br></span></a></p><p><a title="专业准入实施方案一览表（2020修订版）" style="color: rgb(0, 102, 204); font-size: 16px; text-decoration: underline;" href="/njdx/DFS//file/2020/11/26/20201126154548790k6f2z4.pdf"><span style="font-size: 16px;">专业准入实施方案一览表（2020修订版）</span></a></p><p></p><p><span style="font-family: 微软雅黑,Microsoft YaHei; font-size: 16px;"></span></p><p></p></div>\n        <div class="updown"><div id="upanddown"><table width="90%" border="0" align="center" cellpadding="0" cellspacing="0" style=" margin-bottom:10px; margin-top:10px;border-top:dashed 1px #eeeeee;"><tbody><tr><td height="40" style="line-height:30px;">上一篇：<a href="http://xsxy.nju.edu.cn/jyjx/rcpy/20210831/i205411.html">2021级新生学习指南</a></td>  </tr></tbody></table></div>\x3Cscript type="text/javascript" src="/njdx/front/ui/upanddown/upanddown.js?infoid=170797">\x3C/script></div>\n      </div>\n\n    </div>\n\n    \x3Cscript src="/DFS//template/2515/images/footer.js">\x3C/script><div class="g-ft">\n<div class="info">\n<div class="warp">\n<div class="link">\n<div class="title">校内链接：</div>\n<div class="ctx">\n<div><a target="_blank" href="https://bksy.nju.edu.cn/">本科生院</a></div>\n<div><a target="_blank" href="https://xgc.nju.edu.cn/">启明网</a></div>\n<div><a target="_blank" href="https://tuanwei.nju.edu.cn/">团委</a></div>\n<div><a target="_blank" href="http://xlzx.nju.edu.cn/">心理健康教育与研究中心</a></div>\n<div><a target="_blank" href="http://job.nju.edu.cn/">学生就业指导中心</a></div>\n<div><a target="_blank" href="http://lib.nju.edu.cn/">图书馆</a></div>\n<div><a target="_blank" href="https://bwc.nju.edu.cn/">保卫处</a></div>\n<div><a target="_blank" href="https://hospital.nju.edu.cn/">校医院</a></div>\n</div>\n</div>\n<div class="logo">\n<img src="/DFS/template/2515/images/base_5.png">\n</div>\n<div class="contact">\n<div class="title">联系方式：</div>\n<div class="ctx">\n<div><img src="/DFS/template/2515/images/base_6.png" alt="logo">地址：江苏省南京市鼓楼区汉口路22号</div>\n<div><img src="/DFS/template/2515/images/base_7.png" alt="logo">邮编：210093</div>\n<div><img src="/DFS/template/2515/images/base_8.png" alt="logo">电话：025-83592103</div>\n<div><img src="/DFS/template/2515/images/base_7.png" alt="logo">邮箱：xsxy@nju.edu.cn</div>\n</div>\n</div>\n</div>\n</div>\n<div class="copyright">Copyright © Nanjing University, All Rights Reserved </div>\n</div>\n\n    \n    \x3Cscript>\n      function changeSize(px) {\n        $(".m-ctx .content").css({"font-size" : px + "px", "line-height": (10 + parseInt(px)) + "px"});\n        $(".m-ctx .content p").css({"font-size" : px + "px", "line-height": (10 + parseInt(px)) + "px"});\n        $(".m-ctx .content span").css({"font-size" : px + "px", "line-height": (10 + parseInt(px)) + "px"});\n        $(".m-ctx .content div").css({"font-size" : px + "px", "line-height": (10 + parseInt(px))+ "px"});      \n      }\n      var bar = document.querySelector(".m-ctx .wzdx");\n      bar.addEventListener("click", function(event) {\n        switch(event.target.innerText){\n          case "小":\n            changeSize(14);\n            break;\n          case "中":\n            changeSize(16);\n            break;\n          case "大":\n            changeSize(18);\n            break;\n          default:\n            break;\n        }\n      })\n    \x3C/script>\n  \n\n</body></html>'

extract(html)