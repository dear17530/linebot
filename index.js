import linebot from 'linebot'
import dotenv from 'dotenv'
import axios from 'axios'
import cheerio from 'cheerio'

// 讓套件讀取 .env 檔案
// 讀取後可以用 process.env.變數 使用
dotenv.config()

const bot = linebot({
  channelId: process.env.CHANNEL_ID,
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
})

// const wait = (delay) => {
//   return new Promise((reslove, reject) => {
//     setTimeout(() => {
//       reslove(`過了${delay}毫秒`)
//     }, delay)
//   })
// }
const movieName = []
const movieId = []
let inquireMovieId = ''
let inquireMovieName = ''
let inquireLocationNum = ''
let movieLocationNum = []
let movieLocationCity = []
let quickRepierCity = []
let quickRepierDate = []
const datemmdd = []
let movieIdIndex = -1
const movieLocationData = [
  { city: '台北', num: 1 },
  { city: '桃園', num: 2 },
  { city: '新竹', num: 3 },
  { city: '台中', num: 4 },
  { city: '台南', num: 5 },
  { city: '高雄', num: 6 },
  { city: '屏東', num: 7 },
  { city: '苗栗', num: 9 },
  { city: '澎湖', num: 10 },
  { city: '花蓮', num: 11 }
]

let seconds = 0
let dataSeats = []

bot.listen('/', process.env.PORT, () => {
  console.log('機器人啟動')
})

bot.on('message', async event => {
  const main = async () => {
    try {
      let response = await axios.get('https://www.ezding.com.tw/new_ezding/ranking_list/order_top?page=1&page_size=200', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
          'accept-encoding': 'gzip,deflate'
        },
        responseType: 'json'
      })
      let data = response.data.result.list
      for (const title of data) {
        movieName.push(title.movie_title.zh_tw)
      }
      for (const id of data) {
        movieId.push(id.movie_id)
      }

      // 電影名分組放入 quickReply
      const quickRepierMovieName = {
        type: 'text',
        text: '你想搜尋什麼電影?',
        quickReply: {
          items: []
        }
      }
      const quickRepierMovie = (first, last) => {
        for (let i = first; i <= last; i++) {
          quickRepierMovieName.quickReply.items.push({
            type: 'action',
            imageUrl: 'https://github.com/dear17530/linebot/blob/main/trumpet.png?raw=true',
            action: {
              type: 'message',
              label: `${movieName[i]}`,
              text: `${movieName[i]}`
            }
          })
        }
      }

      const flex = []
      let imdbScore = []
      let goldStar = 0

      for (let i = 0; i < 10; i++) {
        imdbScore = []
        if (data[i].imdb_score === 0) {
          imdbScore.push({
            type: 'text',
            text: '查無評分',
            size: 'sm',
            color: '#999999',
            margin: 'md',
            flex: 1
          })
        } else {
          goldStar = Math.floor(`${data[i].imdb_score / 2}`)
          for (let j = 0; j < goldStar; j++) {
            imdbScore.push({
              type: 'icon',
              size: 'sm',
              url: 'https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png'
            })
          }
          for (let j = 0; j < 5 - goldStar; j++) {
            imdbScore.push({
              type: 'icon',
              size: 'sm',
              url: 'https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gray_star_28.png'
            })
          }
          imdbScore.push({
            type: 'text',
            text: `IMDb:${data[i].imdb_score}`,
            size: 'sm',
            color: '#999999',
            margin: 'md',
            flex: 0
          })
        }
        flex.push({
          type: 'bubble',
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'image',
                url: `${data[i].poster_url}`,
                size: 'full',
                aspectMode: 'cover',
                aspectRatio: '7:10',
                gravity: 'top'
              },
              {
                type: 'box',
                layout: 'vertical',
                contents: [
                  {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                      {
                        type: 'text',
                        text: `${data[i].movie_title.zh_tw}`,
                        size: 'xl',
                        color: '#ffffff',
                        weight: 'bold',
                        margin: 'none'
                      }
                    ]
                  },
                  {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                      {
                        type: 'text',
                        text: `${data[i].movie_title.en_us}`,
                        size: 'xs',
                        color: '#ffffff',
                        margin: 'none'
                      }
                    ]
                  },
                  {
                    type: 'box',
                    layout: 'baseline',
                    margin: 'md',
                    contents: imdbScore
                  },
                  {
                    type: 'box',
                    layout: 'baseline',
                    contents: [
                      {
                        type: 'text',
                        text: '片長',
                        color: '#ebebeb',
                        size: 'sm',
                        contents: []
                      },
                      {
                        type: 'text',
                        text: `${data[i].movie_length}分鐘`,
                        color: '#FFFFFF',
                        flex: 7
                      }
                    ],
                    spacing: 'lg',
                    margin: 'xs'
                  },
                  {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                      {
                        type: 'filler'
                      },
                      {
                        type: 'box',
                        layout: 'baseline',
                        contents: [
                          {
                            type: 'filler'
                          },
                          {
                            type: 'text',
                            text: '查詢',
                            color: '#ffffff',
                            flex: 0,
                            offsetTop: '-2px',
                            action: {
                              type: 'message',
                              label: `${data[i].movie_title.zh_tw}`,
                              text: `${data[i].movie_title.zh_tw}`
                            }
                          },
                          {
                            type: 'filler'
                          }
                        ],
                        spacing: 'sm'
                      },
                      {
                        type: 'filler'
                      }
                    ],
                    borderWidth: '1px',
                    cornerRadius: '4px',
                    spacing: 'sm',
                    borderColor: '#ffffff',
                    margin: 'xxl',
                    height: '40px'
                  }
                ],
                position: 'absolute',
                offsetBottom: '0px',
                offsetStart: '0px',
                offsetEnd: '0px',
                backgroundColor: '#03303Acc',
                paddingAll: '20px',
                paddingTop: '18px'
              },
              {
                type: 'box',
                layout: 'vertical',
                contents: [
                  {
                    type: 'text',
                    text: 'HOT',
                    color: '#ffffff',
                    align: 'center',
                    size: 'xs',
                    offsetTop: '3px'
                  }
                ],
                position: 'absolute',
                cornerRadius: '20px',
                offsetTop: '18px',
                backgroundColor: '#ff334b',
                offsetStart: '18px',
                height: '25px',
                width: '53px'
              }
            ],
            paddingAll: '0px'
          }
        })
      }
      if (event.message.text === '電影推薦') {
        const message = {
          type: 'flex',
          altText: '電影推薦',
          contents: {
            type: 'carousel',
            contents: flex
          }
        }
        event.reply(message)
      }
      // 使用者查詢電影，機器人詢問電影名
      if (event.message.text === '電影選單1') {
        quickRepierMovie(0, 12)
      } else if (event.message.text === '電影選單2') {
        quickRepierMovie(13, 25)
      } else if (event.message.text === '電影選單3') {
        quickRepierMovie(26, 38)
      } else if (event.message.text === '電影選單4') {
        quickRepierMovie(39, 51)
      } else if (event.message.text === '電影選單5') {
        quickRepierMovie(51, movieName.length - 1)
      }
      event.reply(quickRepierMovieName)

      // 輸入電影名，機器人回問要查詢 介紹 / 剩餘座位
      if (movieName.includes(event.message.text)) {
        response = await axios.get('https://www.ezding.com.tw/new_ezding/ranking_list/order_top?page=1&page_size=200', {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
            'accept-encoding': 'gzip,deflate'
          },
          responseType: 'json'
        })
        data = response.data.result.list
        inquireMovieName = event.message.text
        movieIdIndex = movieName.indexOf(inquireMovieName)
        inquireMovieId = movieId[movieIdIndex]
        const buttons_template = {
          type: 'template',
          altText: `查詢${event.message.text}`,
          template: {
            type: 'buttons',
            title: `${data[movieIdIndex].movie_title.zh_tw}`,
            text: `${data[movieIdIndex].movie_title.en_us}`,
            actions: [
              {
                type: 'message',
                label: '電影介紹',
                text: '電影介紹'
              },
              {
                type: 'message',
                label: '查詢剩餘位置',
                text: '查詢剩餘位置'
              }
            ]
          }
        }
        event.reply(buttons_template)
      }

      // 使用者回傳電影介紹 機器人回覆
      if (event.message.text === '電影介紹') {
        response = await axios.get(`https://www.ezding.com.tw/new_ezding/movies/${inquireMovieId}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
            'accept-encoding': 'gzip,deflate'
          },
          responseType: 'json'
        })
        data = response.data.result.movie_description
        event.reply(data)
      }
      // 使用者回覆查詢剩餘位置，機器人詢問查詢區域
      if (event.message.text === '查詢剩餘位置') {
        inquireMovieId = ''
        inquireLocationNum = ''
        movieLocationNum = []
        movieLocationCity = []
        quickRepierCity = []
        quickRepierDate = []
        movieIdIndex = movieName.indexOf(inquireMovieName)
        inquireMovieId = `${movieId[movieIdIndex]}`
        console.log(inquireMovieId)
        response = await axios.get(`https://www.ezding.com.tw/new_ezding/orders/find_movie/${inquireMovieId}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
            'accept-encoding': 'gzip,deflate'
          },
          responseType: 'json'
        })
        data = response.data.result
        if (data.length < 1) {
          return event.reply('抱歉，目前系統忙碌中，請查詢其他電影。')
        }
        // 求出location num
        for (const location of data) {
          movieLocationNum.push(location.location)
        }
        // 求出城市名
        for (const num of movieLocationNum) {
          function isLocationNum(s) {
            return s.num === num
          }
          movieLocationCity.push(movieLocationData.find(isLocationNum).city)
        }
        // 城市名放入 quickReply
        quickRepierCity = {
          type: 'text',
          text: '你想查詢哪個城市?',
          quickReply: {
            items: []
          }
        }
        for (const location of movieLocationCity) {
          quickRepierCity.quickReply.items.push({
            type: 'action',
            imageUrl: 'https://github.com/dear17530/linebot/blob/main/location.png?raw=true',
            action: {
              type: 'message',
              label: `${location}`,
              text: `${location}`
            }
          })
        }
        const messageCity = quickRepierCity
        event.reply(messageCity)
      }

      // 使用者回覆城市名，機器人詢問日期
      if (movieLocationCity.includes(event.message.text)) {
        function isLocationCity(s) {
          return s.city === event.message.text
        }
        inquireLocationNum = movieLocationData.find(isLocationCity).num
        response = await axios.get(`https://www.ezding.com.tw/locationbooking?movieid=${inquireMovieId}&location=${inquireLocationNum}`)
        const $ = cheerio.load(response.data)
        data = JSON.parse($('#__NEXT_DATA__').html()).props.pageProps.movieInfo.result.list
        for (const day of data) {
          datemmdd.push(new Date(day.date).getMonth() + 1 + '/' + new Date(day.date).getDate())
        }
        quickRepierDate = {
          type: 'text',
          text: '你想查詢哪一天?',
          quickReply: {
            items: []
          }
        }
        for (const day of datemmdd) {
          quickRepierDate.quickReply.items.push({
            type: 'action',
            imageUrl: 'https://github.com/dear17530/linebot/blob/main/calendar.png?raw=true',
            action: {
              type: 'message',
              label: `${day}`,
              text: `${day}`
            }
          })
        }
        const messageDate = [quickRepierDate]
        event.reply(messageDate)
      }

      // 使用者回覆日期，機器人回覆影城、時間、剩餘座位
      if (datemmdd.includes(event.message.text)) {
        response = await axios.get(`https://www.ezding.com.tw/locationbooking?movieid=${inquireMovieId}&location=${inquireLocationNum}`)
        const $ = cheerio.load(response.data)
        data = JSON.parse($('#__NEXT_DATA__').html()).props.pageProps.movieInfo.result.list
        if (data.length < 1) {
          return event.reply('抱歉，目前區域查無電影或資料系統忙碌中，請查詢其他區域或其他電影。')
        }
        seconds = parseInt(new Date('2021/' + event.message.text + ' ' + '00:00:00').getTime())
        function isseconds(s) {
          return s.date === seconds
        }
        dataSeats = data.find(isseconds)
        let messageMovieTimeSeats = ''
        messageMovieTimeSeats += '以下為電影剩餘座位資訊:\n'
        for (const s of dataSeats.sdata) {
          messageMovieTimeSeats += `\n${s.cinema_data.cinema_name.zh_tw}-${s.movie_version}\n`
          for (const session of s.data_session) {
            if (new Date(session.session_time).getMinutes() === 0) {
              messageMovieTimeSeats += `${new Date(session.session_time).getHours()}:0${new Date(session.session_time).getMinutes()}:剩餘座位${
                session.left_seats
              }\n`
            } else if (new Date(session.session_time).getMinutes() < 10) {
              messageMovieTimeSeats += `${new Date(session.session_time).getHours()}:0${new Date(session.session_time).getMinutes()}:剩餘座位${
                session.left_seats
              }\n`
            } else {
              messageMovieTimeSeats += `${new Date(session.session_time).getHours()}:${new Date(session.session_time).getMinutes()}:剩餘座位${
                session.left_seats
              }\n`
            }
          }
        }
        messageMovieTimeSeats += '\n防疫期間，請保持距離，口罩戴牢。'
        event.reply(messageMovieTimeSeats)
        inquireMovieId = 0
        inquireLocationNum = 0
      }
    } catch (error) {
      const messageError = 'sorry,目前查無資料!'
      event.reply(messageError)
      console.log(error)
    }
  }
  main()
})
