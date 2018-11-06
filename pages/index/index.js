Page({
  data: {
    city: '',
    location: '',
    updateTime: '',
    temperature: '',
    weather: '',
    day7Weather: [], // 7天天气预报
    nowWeather: {},
    airQuality: {}, // 实况空气质量
    qlty: '',
    lifeStyle: [], // 生活指数
    hourlyWeather: [], // 逐小时天气
    wertherObj: {
      key: ['tmp', 'fl', 'hum', 'pcpn', 'wind_dir', 'wind_deg', 'wind_sc', 'wind_spd', 'vis', 'pres', 'cloud', ''],
      val: {
        tmp: '温度(℃)',
        fl: '体感温度(℃)',
        hum: '相对湿度(%)',
        pcpn: '降水量(mm)',
        wind_dir: '风向',
        wind_deg: '风向角度',
        wind_sc: '风力(级)',
        wind_spd: '风速(mk/h)',
        vis: '能见度(km)',
        pres: '气压(mb)',
        cloud: '云量',
      },
    },
    lifeQuality: {
      'comf': '舒适度',
      'drsg': '穿衣',
      'flu': '感冒',
      'sport': '运动',
      'trav': '旅游',
      'uv': '紫外线',
      'cw': '洗车',
      'air': '空气质量'
    }
  },
  // 获取天气
  getWeather(location) {
    wx.showLoading({
      title: '加载中',
    })
    var _this = this
    wx.request({
      // 七天天天气预报
      url: 'https://free-api.heweather.com/s6/weather/forecast',
      data: {
        location: location,
        key: '0f8dfb2c65ec4421a3c0f731751dc1a4'
      },
      method: 'GET',
      header: { 'Content-Type': 'application/json' },
      success: function (res) {
        // res.data.HeWeather6[0].daily_forecast[0].date = '今天'
        // res.data.HeWeather6[0].daily_forecast[1].date = '明天'
        var daily_forecast = res.data.HeWeather6[0].daily_forecast
        for (let i = 0; i < res.data.HeWeather6[0].daily_forecast.length; i++) {
          if(i === 0) {
            daily_forecast[i].date = '今天'
          } else if (i === 1) {
            daily_forecast[i].date = '明天'
          } else {
            daily_forecast[i].date = _this.dateToWeek(daily_forecast[i].date) 
          }
        }
        _this.setData({
          city: res.data.HeWeather6[0].basic.parent_city,
          location: res.data.HeWeather6[0].basic.location,
          day7Weather: daily_forecast
        })
        console.log('7天天气预报', res)
        // 实况天气
        wx.request({
          url: 'https://free-api.heweather.com/s6/weather/now',
          data: {
            location: _this.data.location,
            key: '0f8dfb2c65ec4421a3c0f731751dc1a4'
          },
          method: 'GET',
          header: { 'Content-Type': 'application/json' },
          success: function (res) {
            console.log('实况天气', res)
            _this.setData({
              nowWeather: res.data.HeWeather6[0].now,
              updateTime: res.data.HeWeather6[0].update.loc
            })

            // 逐小时天气预报
            wx.request({
              url: 'https://free-api.heweather.com/s6/weather/hourly',
              data: {
                location: _this.data.location,
                key: '0f8dfb2c65ec4421a3c0f731751dc1a4'
              },
              method: 'get',
              header: { 'Content-Type': 'application/json' },
              success: function (res) {
                console.log('逐小时天气预报', res.data.HeWeather6[0].hourly)
                var hourlyWeather = res.data.HeWeather6[0].hourly
                hourlyWeather.forEach(function (ele) {
                  ele.time = ele.time.substring(11, 16)
                })
                _this.setData({
                  hourlyWeather: res.data.HeWeather6[0].hourly
                })

                // 空气质量实况
                wx.request({
                  url: 'https://free-api.heweather.com/s6/air/now',
                  data: {
                    location: _this.data.city,
                    key: '0f8dfb2c65ec4421a3c0f731751dc1a4'
                  },
                  method: 'get',
                  header: { 'Content-Type': 'application/json' },
                  success: function (res) {
                    console.log('空气质量实况', res)
                    _this.setData({
                      airQuality: res.data.HeWeather6[0].air_now_city,
                      qlty: res.data.HeWeather6[0].air_now_city.qlty
                    })
                    console.log(_this.data.airQuality)

                    // 生活指数
                    wx.request({
                      url: 'https://free-api.heweather.com/s6/weather/lifestyle',
                      data: {
                        location: location,
                        key: '0f8dfb2c65ec4421a3c0f731751dc1a4'
                      },
                      method: 'get',
                      header: { 'Content-Type': 'application/json' },
                      success: function (res) {
                        var lifestyle = res.data.HeWeather6[0].lifestyle
                        lifestyle.forEach(function (ele) {
                          ele.type_text = _this.data.lifeQuality[ele.type]
                        })
                        _this.setData({
                          lifeStyle: lifestyle
                        })
                        wx.hideLoading()
                        console.log('生活指数', lifestyle)
                      }
                    })
                  }
                })
              },
            })
          }
        })
      },
      fail: function (err) {
        console.log(err)
      }
    })
  },
  // 日期 -> 星期
  dateToWeek(date) {
    var day = new Date(date).getDay(),
        week;
    switch (day) {
      case 0: 
        week = '星期天'
        break
      case 1: 
        week = '星期一'
        break
      case 2: 
        week = '星期二'
        break
      case 3: 
        week = '星期三'
        break
      case 4: 
        week = '星期四'
        break
      case 5: 
        week = '星期五'
        break
      case 6: 
        week = '星期六'
        break
      default:
        week = ''
    }
    console.log(week)
    return week
  },
  // 显示dialog
  showLifeStyle(e) {
    wx.showModal({
      title: e.currentTarget.dataset.brf,
      showCancel: false,
      content: e.currentTarget.dataset.text,
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  onLoad: function (options) {
    var that = this;
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        const latitude = res.latitude
        const longitude = res.longitude
        that.getWeather(latitude + ',' + longitude);
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    var that = this;
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        const latitude = res.latitude
        const longitude = res.longitude
        that.getWeather(latitude + ',' + longitude);
      }
    })
    wx.stopPullDownRefresh()
  },
  city: function () {
    wx.navigateTo({
      url: '../selectCity/selectCity',
    })
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})