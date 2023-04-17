import { JSDOM } from 'jsdom'

const html = `
<!doctype html><html lang="zh-CN">
<head></head>
<body>
  <script src="/a.js"></script>
  <script>
    document.body.appendChild(document.createElement("hr"));
  </script>
  6666
  <script>
    document.body.appendChild(document.createElement("hr"));
  </script>
</body>
</html>
`

const x = new JSDOM(html, {
  url: "http://localhost:9997/",
  contentType: "text/html",
  resources: "usable",
  runScripts: "dangerously",
});
// load 里面才有js加载后的dom
x.window.onload = () => {
  const { document } = x.window
  console.log(document.body.outerHTML)
}

