import preParse from '../src/pre-parse-doc.js'

// tag 1 列表、2 详情、3 其他
const data = [
  { tag: "1", url: "https://zb.muc.edu.cn/content/zs/zyxx/" },
  { tag: "2", url: "https://zb.muc.edu.cn/content/zs/bkyk/95d31d10-e05f-11eb-a561-6c92bf4353bb.htm" },
  { tag: "1", url: "https://news.seu.edu.cn/5527/list.htm" },
  { tag: "2", url: "https://news.seu.edu.cn/2023/0714/c5527a454934/page.htm" },
  { tag: "1", url: "http://cxxy.seu.edu.cn/116/list.htm" },
  { tag: "2", url: "http://cxxy.seu.edu.cn/2023/0629/c116a52696/page.htm" },
  { tag: "1", url: "https://www.njzdyy.com/xwzx/yygg.htm" },
  { tag: "2", url: "https://www.njzdyy.com/info/1131/7304.htm" },
  { tag: "1", url: "http://news.cpu.edu.cn/mtyd/list.htm" },
  { tag: "2", url: "http://news.cpu.edu.cn/dd/a5/c253a187813/page.htm" },
  { tag: "1", url: "http://www.whut.edu.cn/tzgg/" },
  { tag: "2", url: "http://www.whut.edu.cn/tzgg/202207/t20220708_532456.htm" },
  { tag: "1", url: "https://naoep.whut.edu.cn/tzgg/" },
  { tag: "1", url: "http://cst.whut.edu.cn/bkjx/" },
  { tag: "1", url: "http://mkszyxy.whut.edu.cn/xyxw/" },
  { tag: "1", url: "http://sports.whut.edu.cn/tzgg/" },
  { tag: "2", url: "http://sports.whut.edu.cn/tzgg/202306/t20230620_559644.shtml" },
  { tag: "2", url: "http://mkszyxy.whut.edu.cn/xyxw/202307/t20230705_932058.shtml" },
  { tag: "1", url: "https://www.bit.edu.cn/xww/zhxw/index.htm" },
  { tag: "1", url: "https://www.uir.cn/Root_jxkydt/" },
  { tag: "1", url: "https://www.gdzqac.edu.cn/meitiguanzhu" },
  { tag: "1", url: "https://www.shjgu.edu.cn/235/list.htm" },
  { tag: "1", url: "http://www.hhvtc.cn/Subject/XWGG/Index.html" },
  { tag: "1", url: "http://www.zzure.edu.cn/xwzx/zyxw.htm" },
  { tag: "2", url: "http://cst.whut.edu.cn/bkjx/jxtz/202109/t20210913_877923.shtml" },
  { tag: "2", url: "https://www.bit.edu.cn/xww/zhxw/yljs/c1f75b81a6314d07a7b879e0e5e70086.htm" },
  { tag: "2", url: "https://www.uir.cn/c/2023-06-16/619437.shtml" },
  { tag: "2", url: "https://www.bjzbzyxy.com/?xxxw/2881.html" },
  { tag: "2", url: "https://www.shjgu.edu.cn/2023/0706/c235a33583/page.htm" },
  { tag: "2", url: "http://www.hhvtc.cn/Subject/XWGG/Article/08D7113F-CB75-7581-7117-E38BB77AB4A0.html" },
  { tag: "2", url: "http://www.zzure.edu.cn/info/1028/1355.htm" },
  { tag: "1", url: "http://www.lzavu.cn/notice/" },
  { tag: "1", url: "http://www.rzvtc.cn/xyyw/news.php?lang=cn&class2=38" },
  { tag: "1", url: "https://zdxy.cqyti.com/gywm/xwdt1.htm" },
  { tag: "1", url: "https://www.hbxgmgpi.edu.cn/lists/11.html" },
  { tag: "1", url: "https://www.qzyz.edu.cn/xwzx/xxxw.htm" },
  { tag: "1", url: "https://www.zjkm.com.cn/manage/focusNews" },
  { tag: "1", url: "http://www.zjjcxy.cn/zhu/news/index.html" },
  { tag: "2", url: "http://www.lzavu.cn/notice/2023-06-01/992.html" },
  { tag: "2", url: "http://www.rzvtc.cn/xyyw/shownews.php?lang=cn&id=305" },
  { tag: "2", url: "https://zdxy.cqyti.com/info/1016/3340.htm" },
  { tag: "2", url: "https://www.hbxgmgpi.edu.cn/shows/11/15221.html" },
  { tag: "2", url: "https://www.qzyz.edu.cn/info/1457/2291.htm" },
  { tag: "2", url: "http://www.zjjcxy.cn/zhu/jyyw/231952.html" },
  { tag: "2", url: "https://www.jxjdxy.edu.cn/info/1030/34821.html" },
  { tag: "1", url: "https://www.jxjdxy.edu.cn/xwbd/mtgz.htm" },
  { tag: "1", url: "https://www.gdstpec.edu.cn/index/xxyw.htm" },
  { tag: "1", url: "http://www.wjtts.net/cyxu/tzgg.htm" },
  { tag: "1", url: "http://www.cq51.cn/cq51/xueyuanxinwen/" },
  { tag: "1", url: "https://www.gzwhlyzy.cn/news/6/" },
  { tag: "1", url: "http://www.gxngy.cn/zxzx/xwdt.htm" },
  { tag: "1", url: "https://www.dlmu.edu.cn/hdzl.htm" },
  { tag: "2", url: "https://www.gdstpec.edu.cn/info/1030/1116.htm" },
  { tag: "2", url: "http://www.wjtts.net/info/1093/6892.htm" },
  { tag: "2", url: "http://www.cq51.cn/cq51/xueyuanxinwen2023/1497.html" },
  { tag: "2", url: "https://sft.guizhou.gov.cn/ztzl_97/ztjy/sjjs/202305/t20230512_79669234.html" },
  { tag: "2", url: "http://www.gxngy.cn/info/1013/1657.htm" },
  { tag: "2", url: "https://www.dlmu.edu.cn/info/1096/49608.htm" },
  { tag: "2", url: "https://www.gxlvtc.edu.cn/gxlvtc/doc?d=1613&c=1057" },
  { tag: "1", url: "https://www.gxlvtc.edu.cn/gxlvtc/columns?c=1057" },
  { tag: "1", url: "https://www.hdkz.edu.cn/news/" },
  { tag: "1", url: "https://www.hsvch.edu.cn/xueyuanxinwen/tongzhigonggao/" },
  { tag: "1", url: "https://www.gztcme.cn/column/21-1.html" },
  { tag: "1", url: "https://www.jxuspt.com/Z02_XWZX/YuanBuDynamic.htmlx?columnId=42" },
  { tag: "1", url: "https://www.cqiivc.com/lists/201.html" },
  { tag: "1", url: "http://www.czmc.cn/index/mtbd.htm" },
  { tag: "1", url: "http://www.zzhvc.com/newslist.aspx?id=0069" },
  { tag: "2", url: "https://www.hdkz.edu.cn/news/dongtai/1688344177625.html" },
  { tag: "2", url: "https://www.hsvch.edu.cn/xueyuanxinwen/tongzhigonggao/2023-04-28/505.html" },
  { tag: "2", url: "http://www.zzhvc.com/newsview.aspx?id=6482" },
  { tag: "2", url: "https://gxt.guizhou.gov.cn/gxdt/tzgg/202306/t20230615_80303405.html" },
  { tag: "2", url: "https://www.jxuspt.com/news.htmlx?newsID=235237&Page=0&size=18&columnId=18" },
  { tag: "2", url: "https://www.kxedu.net/html/969/2022-12-18/content-2495.html" },
  { tag: "2", url: "https://www.cqiivc.com/shows/201/131.html?catname=%E6%A0%A1%E5%9B%AD%E6%96%B0%E9%97%BB" },
  { tag: "2", url: "http://czrb.bohaitoday.com/pc/content/202210/31/content_73163.html" },
  { tag: "1", url: "https://www.bdu.edu.cn/syxw/xsdt.htm" },
  { tag: "1", url: "http://www.zstp.edu.cn/index/yw.htm" },
  { tag: "1", url: "https://www.stpt.edu.cn/731/list.htm" },
  { tag: "1", url: "https://www.xcc.edu.cn/xinwenwang/zhxw/index.html" },
  { tag: "1", url: "https://vtc.mhedu.sh.cn/xwzx/tzgg" },
  { tag: "1", url: "https://www.ycvc.jx.cn/index/xxyw.htm" },
  { tag: "1", url: "http://www.jxxdxy.edu.cn/news-list-xiaoyuanyaowen.html" },
  { tag: "1", url: "https://sccc.edu.cn/zpagelist.jsp?id=68467e09c23b4bc89666d07cbf5d7c0a" },
  { tag: "1", url: "http://www.qhdgzy.com/xuexiaoyaowen/" },
  { tag: "1", url: "http://www.jxvc.jx.cn/index/cyxw.htm" },
  { tag: "1", url: "https://www.gla.uestc.edu.cn/tzgg/zxtz.htm" },
  { tag: "2", url: "https://www.bdu.edu.cn/info/1101/5306.htm" },
  { tag: "2", url: "http://www.zstp.edu.cn/info/1034/19106.htm" },
  { tag: "2", url: "https://www.stpt.edu.cn/2023/0710/c716a30353/page.htm" },
  { tag: "2", url: "https://www.xcc.edu.cn/xinwenwang/zhxw/706343/index.html" },
  { tag: "2", url: "https://vtc.mhedu.sh.cn/zs/zsjz/detail_2023041016024327839692.html" },
  { tag: "2", url: "https://www.ycvc.jx.cn/info/1012/18572.htm" },
  { tag: "2", url: "http://www.jxxdxy.edu.cn/news-show-57129.html" },
  { tag: "2", url: "http://www.sccc.edu.cn/content.jsp?id=402880898909ebdc0189242c178e01a1&classid=497c179f234f4beea61a8833d93adeed" },
  { tag: "2", url: "http://www.qhdgzy.com/xinwengonggao/132.html" },
  { tag: "2", url: "http://www.jxvc.jx.cn/info/1056/14782.htm" },
  { tag: "2", url: "https://www.gla.uestc.edu.cn/info/1009/13105.htm" },
  { tag: "2", url: "https://www.jxsfjy.cn/news-show-12301.html" },
  { tag: "1", url: "https://www.jxjtxy.edu.cn/news-list-xydt.html" },
  { tag: "2", url: "https://www.jxjtxy.edu.cn/news-show-10730.html" },
  { tag: "1", url: "http://www.sxczyz.cn/portal/list/index.html?id=9" },
  { tag: "2", url: "http://www.sxczyz.cn/portal/article/index.html?id=126&cid=9" },
]
let ratio = 0;
for (let i = 0; i < data.length; i++) {
  const { url, tag } = data[i]
  try {
    const { pageType } = await preParse(url)
    if ((pageType.includes("列表") && tag === '1') || (pageType.includes("详情") && tag === '2')) {
      ratio++
    } else {
      console.log(url, '::', pageType, '\ttag::')
    }
  } catch (error) {
    ratio++
    // console.log(url, '::', error)
  }
}

console.log('总成功率：' + Math.floor(ratio / data.length * 100))

process.exit(0)

/*
http://www.lzavu.cn/notice/2023-06-01/992.html :: 50%概率是列表页       tag::
http://www.rzvtc.cn/xyyw/shownews.php?lang=cn&id=305 :: 30%概率是列表页         tag::
https://www.gdstpec.edu.cn/index/xxyw.htm :: 60%概率是详情页    tag::
https://www.gxlvtc.edu.cn/gxlvtc/columns?c=1057 :: 60%概率是详情页      tag::
https://www.cqiivc.com/lists/201.html :: 120%概率是详情页       tag::
http://www.zzhvc.com/newsview.aspx?id=6482 :: 50%概率是列表页   tag::
http://www.qhdgzy.com/xuexiaoyaowen/ :: 100%概率是详情页        tag::
*/