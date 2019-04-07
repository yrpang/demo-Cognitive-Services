//index.js
const app = getApp()
const ctx = wx.createCanvasContext('image')
var clocknum = null

Page({
  data: {
    imagePath: null,
    text: null,
    imageHeight: 0,
    imageWidth: 0,
    confidence: 0
  },

  cam: function()
  {
    var that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['original','compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        console.log("upload start")
        
        if (res.tempFiles[0].size >= 1e6)
        {
          wx.compressImage({
            src: res.tempFiles[0].path,
            success(res){
              that.setData({
                imagePath: res.tempFilePath
              })
              that.setImageInfo(res.tempFilePath)
              that.upload(res.tempFilePath)
            },
            fail(res){
              console.log(res)
              wx.showModal({
                title: '错误',
                content: '压缩失败，请再试一次',
              })
            }
          })
        }else{
          that.setData({
            imagePath: res.tempFilePaths[0]
          })
          that.setImageInfo(res.tempFilePaths[0])
          that.upload(res.tempFilePaths[0])
        }
        
      }
    })

    
  },

  setImageInfo: function(image){
    var that = this
    wx.getImageInfo({
      src: image,
      success(res) {
        that.setData({
          imageHeight: res.height,
          imageWidth: res.width
        })
      }
    })
  },

  upload: function(image)
  {
    var that = this
    wx.showLoading({
      title: "正在上传…",
      mask: true
    }),
    that.clocknum = setTimeout(function () {
      wx.hideLoading()
      wx.showLoading({
        title: '网络有点慢…',
        mask: true
      })
    }, 4000)
    wx.uploadFile({
      url: 'https://demo.pangyiren.com/',
      filePath: image,
      name: 'image',
      success(res) {
        try{
          var data = JSON.parse(res.data)
        }catch(e){
          that.error()
        }
        
        if (res.statusCode != 200 || data.code == -1){
          that.error()
        }
        
        var confidence = data.description.captions[0].confidence * 100
        that.setData({
          text: data.description.captions[0].text,
          confidence: confidence.toFixed(2)
        })
        clearTimeout(that.clocknum)
        wx.hideLoading()
        that.drawimage()
      },

      fail() {
        that.error()
      }
    })
  },

  error: function()
  {
    var that = this
    clearTimeout(that.clocknum)
    wx.hideLoading();
    wx.showModal({
      title: '错误',
      content: '上传失败请重试',
      showCancel: false
    })
    return
  },

  drawimage: function () {
    var that = this

    var $width = that.data.imageWidth
    var $height = that.data.imageHeight
    var ratio = $width / $height;

    var viewWidth = 300,
        viewHeight = 300 / ratio; 

    ctx.drawImage(that.data.imagePath, 0, 0, viewWidth, viewHeight)

    //ctx.setFontSize(20)
    //ctx.fillText(that.data.text, 20, 20)

    ctx.draw()
    
    
  }

})

