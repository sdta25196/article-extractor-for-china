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
  byline: /byline|author|dateline|writtenby|p-author/i,
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



