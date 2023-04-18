import fetch from 'cross-fetch'
import https from 'https'
import http from 'http'


/** 请求url 获得html */
const run = async (url, options = {}) => {
  const {
    headers = {
      'user-agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/111.0'
    },
  } = options

  const agent = url.startsWith('https') ? new https.Agent({ rejectUnauthorized: false }) : new http.Agent({ rejectUnauthorized: false })
  const res = await fetch(url, { headers, agent })

  const status = res.status
  if (status >= 400) {
    throw new Error(`状态码：${status}`)
  }
  const resCopy = res.clone()
  console.log(1)
  const buffer = await resCopy.buffer()
  console.log(2)
  let text = await res.text()
  console.log(3)
  return text.toString().trim()

}

try {
  let a = await run('https://gkcx.eol.cn')
  console.log(a)
  // run('https://gkcx.eol.cn')
} catch (error) {
  console.log(error.toString())
  console.log(6666)
}