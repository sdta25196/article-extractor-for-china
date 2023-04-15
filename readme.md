# 中文文章提取

## 启动

1. yarn 
2. yarn start

## 常见规则

* 视觉分析 - 模拟真实用户，分析字号、字体、颜色信息，最终确定一个区域为内容区。
* 模板配置 - 先确认模板，如果匹配到模板直接按照模板的标准抓取。
  * 规则匹配 - 属于模板的一种，例如指定规则为有time\title\author\content。此时content是正文。
* 关键字匹配 - 正文、content、title等文案或者class。
* 深度学习 - 利用深度学习库，进行训练学习。
* 文本分行后的文本密度 或者 标签密度 进行判断。 
  * 密度判断对短文无效
* 利用分析 + 规则匹配,计算权重重新排列dom, 来获得文章
  * 权重的判定方法决定了最终文章的准确性


本项目采取 利用分析 + 规则匹配,计算权重重新排列dom, 来获得文章。

## 规则

**详情页**

获取正文标题：
  * 提取网页的 title \ .title \ #title \ h1 \ h2

正文内容a标签密度小于 5% （a的文本量 / 全部文本）

正文内容包含大量的标点符号

正文长度大于50

嵌入标签需要分别处理

不同情况处理：
* pdf：需要拿到iframe中的地址，然后拿地址中的全部html进行处理
* js渲染：延迟拿全部html
* 内容是图片：不处理

## TODO

* 拆分type
* 入口代码编写
* 列表规则、分页规则
* 判断页面是否符合分析逻辑
* 深度学习分析法
* 对比luin的代码