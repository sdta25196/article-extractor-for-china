import encoding from 'encoding'

const text = encoding.convert('姝ｆ枃', "utf8", 'gbk');

console.log(text.toString());