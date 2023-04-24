# 中文文章提取

## 启动

1. yarn 
2. yarn start
3. 浏览器访问：http://localhost:3000/

## 特性

* 支持对列表和分页(包括js分页)的识别与抓取
* 支持对文章详情页面的抓取
* 支持js分页的列表抓取
* 针对更多国内网站进行了优化
* 支持 HTML5 标签 ( article, section) 
* 支持GBK、GB2312等编码
* 自动将图像和链接的相对 URL 转换为绝对 URL

## 优化方案 

* 网站第一次分析了之后，给这个网站一堆标记，然后第二次分析的时候直接根据标记优化即可。标记使用参数传入即可。
* 使用 linkedom 进行实例化，如果我们认为此也为列表页面，并且分页是js渲染的分页，就改成 jsdom进行实例化。 - 仅列表页面需要使用jsdom
* SPA 页面需要使用无头浏览器获取html，在用jsdom来实例化（处理分页逻辑）。 - 仅列表页面需要使用jsdom

* 有的框架会把文章放到 `#vsb_content` 中
* 有些框架会有两个body, 而文章在第二个body中

## 常见规则

* 视觉分析 - 模拟真实用户，分析字号、字体、颜色信息，最终确定一个区域为内容区。
* 模板配置 - 先确认模板，如果匹配到模板直接按照模板的标准抓取。
  * 规则匹配 - 属于模板的一种，例如指定规则为有time\title\author\content。此时content是正文。
* 关键字匹配 - 正文、content、title等文案或者class。
* 深度学习 - 利用深度学习库，进行训练学习。 
  * 外层要处理的问题，一样都少不了。SPA、编码、相对链接等
* 文本分行后的文本密度 或者 标签密度 进行判断。 
  * 密度判断对短文无效

本项目采取 计算不同节点的权重，通过贪心策略获取更好的节点, 最终获得文章。

## 规则

制定规则，就代表我们要放弃规则之外的东西

**详情页**

正文内容a标签密度小于 5% （a的文本量 / 全部文本）

逗号只存在于内容中，正文内容包含大量的标点符号

获取正文标题：
  * 提取网页的 title \ .title \ #title \ h1 \ h2

正文长度大于50

**列表**

是个链接，但是链接内容更长

列表内容比例~

## 不同情况处理：

**自古以来：滑动、pdf、图片、弹窗、以及一部分JS渲染形式，都不处理**

* 内容是一张图片

**正常抓取内容** 虽然不准确，但是没关系。

https://www.shupl.edu.cn/jjfxy/2022/0929/c4267a115624/page.htm

* 详情页是文件下载

**不支持** 通过文档类型判断直接过滤为不支持。

https://xb.gdou.edu.cn/__local/C/8F/5C/963522D57066B23D96CE97CDE6B_751CF413_C200.doc?e=.doc

* 滑动

**需要配置header头（cookie）** 页面判断我们为爬虫，返回了滑动验证

https://www.ccdi.gov.cn/yaowenn/202304/t20230411_258083.html

* 详情页为弹出窗口。
 
**不处理。** 没有详情页，对于详情页抓取来说，不存在这种情况。

https://jxjy.sitsh.edu.cn/info?type=1

* pdf

拿iframe里的html, 有的pdf需要滚动才能拿到全部html; 

iframe: (class + id 一定包含pdf 并且 src结尾一定是pdf)

https://zs.jmi.edu.cn/3b/69/c1702a80745/page.htm

* 加密 -JS渲染，不过可以通过转码，拿到数据。

https://www.sdjnwx.com/articles/1171

https://www.sdjnwx.com/articles/1131

* JS 加载 - 暂时不处理

https://www.shjgu.edu.cn/2023/0411/c235a32886/page.htm

https://www.shjgu.edu.cn/2023/0411/c235a32882/page.htm

https://www.zhjpec.edu.cn/MobileContent?id=1632554595328409602

https://www.jxmtc.com/info/1041/9948.htm

* JS 加载 - 内容详情为一张图片
 
https://www.whzkb.cn/#/detail?pageid=820&typeid=5

## TODO

* ~~拆分type~~
* ~~添加encoding 处理不同的编码，gbk、GB2312支持~~
* ~~判断页面是否符合分析逻辑~~
* ~~http与https认证~~
* ~~入口代码编写~~
* jsdom + linkdom 实现对SPA抓取，并且提供足够的优化，或许还需要加入puppeteer。
  * jsdom 可以执行js
  * linkdom 更快
* 列表规则、分页规则
* 部分页面需要设置cookie - 得添加cookie设置的功能