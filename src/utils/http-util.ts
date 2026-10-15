import axios from 'axios'
/**
 * @author 真心
 * @date 2021/2/2 21:03
 * @email qgzhenxin@qq.com
 * @description axios 封装
 */

// 创建axios服务
const service = axios.create({
  timeout: 1000 * 10, // 超时
  withCredentials: true // 跨域携带cookie
})

class HttpUtil {
  /**
   * 发送Get请求
   * @param url 链接
   * @param params 参数
   * @return 数据
   */
  static async get(url: string, params: any = {}, headers: any = {}) {
    params.t = Date.now()
    try {
      const data: any = await service.get(url, {
        params: params,
        headers
      })
      return data.data
    } catch (e) {
      const error = e.response
      if (error) {
        return error.data
      }
      return e.message
    }
  }

  /**
   * 发送POST请求
   * @param url 链接
   * @param params 参数
   * @return 数据
   */
  static async post(url: string, params: any = {}, headers: any = {}) {
    params.t = Date.now()
    try {
      const data: any = await service.post(url, params, {
        headers
      })
      return data.data
    } catch (e) {
      const error = e.response
      if (error) {
        return error.data
      }
      return e.message
    }
  }

  /**
   * 通用请求（自定义翻译接口使用）：不注入时间戳参数，支持任意方法与请求体
   * @param config axios 请求配置 { url, method, params, data, headers }
   * @return { ok, status, data }
   */
  static async request(config: { url: string, method?: 'GET' | 'POST', params?: any, data?: any, headers?: any }) {
    try {
      const res: any = await service.request({
        headers: {},
        ...config
      })
      return { ok: true, status: res.status, data: res.data }
    } catch (e) {
      if (e.response) {
        return { ok: false, status: e.response.status, data: e.response.data }
      }
      return { ok: false, status: 0, data: e.message }
    }
  }
}

export default HttpUtil
