import express from 'express'
import bodyParser from 'body-parser'
import fs from 'fs'
import path from 'path'
import run from '../src/index.js'

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', async (req, res) => {
  let str = fs.readFileSync(path.resolve('example', "./index.html"), 'utf-8')
  res.send(str)
})

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
      throw new Error(data)
    }
    return res.json({
      error: 0,
      message: '文章提取成功',
      data,
    })
  } catch (err) {
    return res.json({
      error: 1,
      message: err.message,
      data: null,
    })
  }
})

app.listen(3000, () => {
  console.log('Server is running at http://localhost:3000')
})
