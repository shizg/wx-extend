# wx-extend
微信小程序-增强处理（网络、支付等）


## 使用方法

1. app.js 顶部引入扩展：
```javascript
require('/wx-extend').extend(wx, {
  baseUrl: 'http://localhost:8080/api/'
});
```

2. 调用方式：wx.http.xxx
```javascript
wx.http.get('/app/56', function(err, res) {
  console.log(res);
});

wx.http.put('/app/57', {a: 3 , b: 4, c: '533'}, function(err, res) {
  console.log(res);
});

wx.http.post('/app/58', {a: 33 , b: 44, c: '5334'}, function(err, res) {
  console.log(res);
});

wx.http.delete('/app/59', function(err, res) {
  console.log(res);
});
```
