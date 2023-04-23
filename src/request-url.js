import fetch from 'cross-fetch'
import encoding from 'encoding'
import https from 'https'
import http from 'http'

let timeoutPromise = (timeout) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('')
    }, timeout)
  })
}

/** 请求url 获得html */
export default async (url, options = {}) => {
  const {
    headers = {
      'user-agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/111.0'
    },
  } = options

  const agent = url.startsWith('https') ? new https.Agent({ rejectUnauthorized: false }) : new http.Agent({ rejectUnauthorized: false })
  const res = await Promise.race([timeoutPromise(5000), fetch(url, { headers, agent })])

  if (typeof res === 'string') {
    throw new Error(`超时错误`)
  }

  const status = res.status
  if (status >= 400) {
    throw new Error(`状态码：${status}`)
  }

  const content_type = parseContentType(res.headers.get('content-type'))
  if (!content_type.mimeType || content_type.mimeType === "text/html") {
    const buffer = await res.buffer()
    const charset = findHTMLCharset(buffer) || content_type.charset
    let text = buffer

    if (charset && charset !== 'utf-8') {
      text = encoding.convert(buffer, "UTF-8", charset)
    }

    return text.toString().trim()
  }

  throw new Error("请求类型" + content_type.mimeType + "不是html")
}

function parseContentType(str) {
  if (!str) {
    return {}
  }
  let parts = str.split(";")
  let mimeType = parts.shift()
  let charset
  let chparts

  for (var i = 0, len = parts.length; i < len; i++) {
    chparts = parts[i].split("=")
    if (chparts.length > 1) {
      if (chparts[0].trim().toLowerCase() == "charset") {
        charset = chparts[1]
      }
    }
  }

  return {
    mimeType: (mimeType || "").trim().toLowerCase(),
    charset: (charset || "UTF-8").trim().toLowerCase()
  }
}

function findHTMLCharset(htmlbuffer) {

  const body = htmlbuffer.toString("ascii")
  let input, meta, charset

  if (meta = body.match(/<meta\s+http-equiv=["']content-type["'][^>]*?>/i)) {
    input = meta[0]
  }

  if (input) {
    charset = input.match(/charset\s?=\s?([a-zA-Z\-0-9]*);?/)
    if (charset) {
      charset = (charset[1] || "").trim().toLowerCase()
    }
  }

  if (!charset && (meta = body.match(/<meta\s+charset=["'](.*?)["']/i))) {
    charset = (meta[1] || "").trim().toLowerCase()
  }

  return charset
}