
/**
 * 发送网络请求
 */
const request = (method, url, data, callback) => {
  const config = wx.http.config;

  // 判断data是否是函数，是则data为null
  if (typeof(data) == 'function') {
    callback = data;
    data = null;
  }

  wx.showLoading();

  wx.request({
    method: method,
    url: config.baseUrl + url,
    data: data,
    header: {
      'Content-Type': "application/x-www-form-urlencoded"
    },
    complete: function (res) {
      wx.hideLoading();

      console.log(res);
      var err = (res.errMsg != 'request:ok');
      return callback && callback(err, res.data);
    }
  });
};

/**
 * GET请求
 */
const get = (url, data, callback) => {
  request('GET', url, data, callback);
};

/**
 * PUT请求
 */
const put = (url, data, callback) => {
  request('PUT', url, data, callback);
};

/**
 * POST请求
 */
const post = (url, data, callback) => {
  request('POST', url, data, callback);
};

/**
 * DELETE请求
 */
const del = (url, data, callback) => {
  request('DELETE', url, data, callback);
};


/**
 * 文件上传
 */
const upload = (url, data, callback, update) => {
  const config = wx.http.config;

  const task = wx.uploadFile({
    url: config.baseUrl + url,
    filePath: data.filePath,
    name: 'file',
    formData: data,
    complete: function (res) {

      var err = (res.errMsg != 'request:ok');
      return callback && callback(err, res.data);
    }
  })

  // 上传更新处理
  update && task.onProgressUpdate(update);

  return task;
};


/**
 * 文件下载
 */
const download = (url, callback) => {
  const config = wx.http.config;

  wx.downloadFile({
    url: config.baseUrl + url,
    complete: function (res) {

      var err = (res.errMsg != 'request:ok');
      return callback && callback(err, res.data);
    }
  })
};


/**
 * WebSocket
 */
const socket = (url, data, callback) => {
  const config = wx.http.config;

  // 判断data是否是函数，是则data为null
  if (typeof(data) == 'function') {
    callback = data;
    data = null;
  }

  const socket = wx.connectSocket({
    url: config.wsUrl + url,
    data: data,
    header: {
      'Content-Type': "application/x-www-form-urlencoded"
    }
  });

  // socket 接收消息回调处理
  socket.onMessage(function(res) {

    var err = (res.errMsg != 'request:ok');
    var ret = callback && callback(err, res.data);

    // 如果返回true，则关闭连接
    ret && socket.close();

    return ret;
  })


  return socket;
};


/**
 * 支付处理
 */
const payment = (url, data, callback) => {
  const config = wx.pay.config;

  // // 判断data是否是函数，是则data为null
  // if (typeof(data) == 'function') {
  //   callback = data;
  //   data = null;
  // }

  // exports._prepay = {} // 保存上次支付信息
  // key = MD5(url + JSON.stringify(data))
  // 如果相等则直接调用 wx.requestPayment
  // 否则先向后台发送请求支付
  const paydata = {};

  if (paydata) {
    wx.requestPayment(paydata);
    return;
  }

  // 发送后台生成订单
  post(url, data, function(err, res) {
    if (err) {
      return callback && callback(err, res);
    }

    // 参数	类型	必填	说明
    // timeStamp	String	是	时间戳从1970年1月1日00:00:00至今的秒数,即当前的时间
    // nonceStr	String	是	随机字符串，长度为32个字符以下。
    // package	String	是	统一下单接口返回的 prepay_id 参数值，提交格式如：prepay_id=*
    // signType	String	是	签名算法，暂支持 MD5
    // paySign	String	是	签名,具体签名方案参见小程序支付接口文档;
    // success	Function	否	接口调用成功的回调函数
    // fail	Function	否	接口调用失败的回调函数
    // complete	Function	否	接口调用结束的回调函数（调用成功、失败都会执行）

    // res.data 返回前5个参数
    const paydata = res.data;

    // 设置回调
    paydata.complete = function (res) {

      var err = (res.errMsg != 'request:ok');
      return callback && callback(err, res.data);
    }

    wx.requestPayment(res);
  });
};

/**
 * 扩展微信处理
 */
module.exports.extend = (wx, config) => {

  // // 局部变量
  // exports.wx = wx;

  // 扩展微信Http处理
  wx.http = {
    // HTTP请求
    get, put, post, 'delete': del,

    // 文件上传、下载
    upload, download,

    //Web Socket
    socket,

    // 配置信息
    config: config || {
      baseUrl: '',  // 网络请求地址
      wsUrl: ''     // WebSocket地址
    }
  };

  // 扩展微信Pay处理
  wx.pay = {
    // 支付
    payment,

    // 配置
    config: config || {
      baseUrl: '',  // 网络请求地址
    }
  };

  return wx;
};
