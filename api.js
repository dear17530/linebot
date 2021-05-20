import axios from 'axios'

const main = async () => {
  try {
    const response = await axios.get('https://www.ezding.com.tw/movieInfo?movieid=9ca97b3011124a548998f732e7752fb5')
    console.log(response.data)
  } catch (error) {
    console.log('發生錯誤')
  }
}
main()