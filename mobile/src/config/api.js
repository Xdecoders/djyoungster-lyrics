import axios from 'axios'

export const BASE_URL = 'https://djyoungster.com/api/public'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

export default api
