import express from 'express'
import bodyParser from 'body-parser'
import path from 'path'
import run from '../src/index.js'

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static(path.join('example')));

app.post('/extract', async (req, res) => {
  const url = req.body.url
  if (!url) {
    return res.json({
      error: 1,
      message: 'url参数未传',
    })
  }
  try {
    const data = await run(url)
    if (!data || data.error === 1) {
      throw new Error(data?.message || "哦豁，出现未知错误")
    }
    return res.json({
      error: 0,
      message: '文章提取成功',
      data,
    })
  } catch (err) {
    return res.json({
      error: 1,
      message: err.toString(),
      data: null,
    })
  }
})

app.listen(3000, () => {
  console.log('Server is running at http://localhost:3000')
})
