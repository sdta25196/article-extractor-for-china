/** 正则集合 */
export const REGEXPS = {
  /** 一些不太可能的class 和 id */
  unlikelyCandidates: /-ad-|ai2html|banner|breadcrumbs|combx|comment|community|cover-wrap|disqus|extra|footer|gdpr|header|legends|menu|related|remark|replies|rss|shoutbox|sidebar|skyscraper|social|sponsor|supplemental|ad-break|agegate|pagination|pager|popup|yom-remote/i,
  /** 一些可能的class 和 id */
  okMaybeItsACandidate: /and|article|body|column|content|main|shadow/i,
  /** 一些大概率是文章的class 和 id */
  positive: /article|body|content|entry|hentry|h-entry|main|page|pagination|post|text|blog|story/i,
  /** 一些导航 class */
  negative: /-ad-|hidden|^hid$| hid$| hid |^hid |banner|combx|comment|com-|contact|foot|footer|footnote|gdpr|masthead|media|meta|outbrain|promo|related|scroll|share|shoutbox|sidebar|skyscraper|sponsor|shopping|tags|tool|widget/i,
  extraneous: /print|archive|comment|discuss|e[\-]?mail|share|reply|all|login|sign|single|utility/i,
  /** 一些可能是作者的class 和 id */
  author: /byline|author|dateline|writtenby|p-author|publisher/i,
  replaceFonts: /<(\/?)font[^>]*>/gi,
  /** 多个空白符 */
  normalize: /\s{2,}/g,
  /** 一些视频网站的标识 */
  videos: /\/\/(www\.)?((dailymotion|youtube|youtube-nocookie|player\.vimeo|v\.qq)\.com|(archive|upload\.wikimedia)\.org|player\.twitch\.tv)/i,
  /** 一些分享属性 */
  shareElements: /(\b|_)(share|sharedaddy)(\b|_)/i,
  nextLink: /(next|weiter|continue|>([^\|]|$)|»([^\|]|$))/i,
  prevLink: /(prev|earl|old|new|<|«)/i,
  tokenize: /\W+/g,
  whitespace: /^\s*$/,
  /** 标点符号 */
  punctuation: /[。|，|、|！|!|,]/g,
  /** 非空白符结尾，代表有内容 */
  hasContent: /\S$/,
  hashUrl: /^#.+/,
  srcsetUrl: /(\S+)(\s+[\d.]+[xw])?(\s*(?:,|$))/g,
  /** base64的地址 */
  b64DataUrl: /^data:\s*([^\s;,]+)\s*;\s*base64\s*,/i,
  jsonLdArticleTypes: /^Article|AdvertiserContentArticle|NewsArticle|AnalysisNewsArticle|AskPublicNewsArticle|BackgroundNewsArticle|OpinionNewsArticle|ReportageNewsArticle|ReviewNewsArticle|Report|SatiricalArticle|ScholarlyArticle|MedicalScholarlyArticle|SocialMediaPosting|BlogPosting|LiveBlogPosting|DiscussionForumPosting|TechArticle|APIReference$/
}

/** style 和弃用的属性 */
export const PRESENTATIONAL_ATTRIBUTES = ["align", "background", "bgcolor", "border", "cellpadding", "cellspacing", "frame", "hspace", "rules", "style", "valign", "vspace"]

/** 需要删除宽高的标签 */
export const DEPRECATED_SIZE_ATTRIBUTE_ELEMS = ["TABLE", "TH", "TD", "HR", "PRE"]

/** 计分元素 */
export const DEFAULT_TAGS_TO_SCORE = "section,h2,h3,h4,h5,h6,p,td,pre".toUpperCase().split(",")

/** 不可能的 role 属性 */
export const UNLIKELY_ROLES = ["menu", "menubar", "complementary", "navigation", "alert", "alertdialog", "dialog"]

/** 块级元素 */
export const DIV_TO_P_ELEMS = new Set(["BLOCKQUOTE", "DL", "DIV", "IMG", "OL", "P", "PRE", "TABLE", "UL"])

/** 包裹文章的块级元素 */
export const ALTER_TO_DIV_EXCEPTIONS = ["DIV", "ARTICLE", "SECTION", "P"]

/**
 * 一些分段的元素，注释掉的元素会在段落处理逻辑中被删除，所以可以忽略 ，出自mozilla文档：
 * https://developer.mozilla.org/zh-CN/docs/Web/HTML/Content_categories#%E7%9F%AD%E8%AF%AD%E5%86%85%E5%AE%B9
 */
export const PHRASING_ELEMS = [
  // "CANVAS", "IFRAME", "SVG", "VIDEO",
  "ABBR", "AUDIO", "B", "BDO", "BR", "BUTTON", "CITE", "CODE", "DATA",
  "DATALIST", "DFN", "EM", "EMBED", "I", "IMG", "INPUT", "KBD", "LABEL",
  "MARK", "MATH", "METER", "NOSCRIPT", "OBJECT", "OUTPUT", "PROGRESS", "Q",
  "RUBY", "SAMP", "SCRIPT", "SELECT", "SMALL", "SPAN", "STRONG", "SUB",
  "SUP", "TEXTAREA", "TIME", "VAR", "WBR"
]

/** html实体转换列表 */
export const HTML_ESCAPE_MAP = {
  "lt": "<",
  "gt": ">",
  "amp": "&",
  "quot": '"',
  "apos": "'",
}

/** 元素 nodeType === 1 */
export const ELEMENT_NODE = 1

/** 文本元素 nodeType === 3 */
export const TEXT_NODE = 3

export const DEFAULT_CHAR_THRESHOLD = 500


export const DEFAULT_MAX_ELEMS_TO_PARSE = 0

export const DEFAULT_N_TOP_CANDIDATES = 5
