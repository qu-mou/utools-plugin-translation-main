import { http } from "../utils";
import ApiInfo from "./api-info";
import Lang from "./lang";

/**
 * UApiPro (uapis.cn) 翻译
 * 官方文档: https://uapis.cn/docs/api-reference/post-translate-text
 * POST https://uapis.cn/api/v1/translate/text
 * 请求体: { to_lang: <目标语言代码>, text: <文本> }
 * 源语言自动检测；返回 { translate: <译文>, text: <原文> }
 *
 * 两种模式:
 * - 免费模式: 无需参数，使用访客免费额度
 * - API 密钥模式: 请求头 Authorization: Bearer <key>
 *   （官方 FAQ: 标准做法是在请求头中加入 Authorization: Bearer 你的key）
 */
export default async function uapis(text: string, srcLang: Lang, toLang: Lang) {
    const cfg = ApiInfo.uapis
    const headers: any = {}
    if (cfg && cfg.mode === 'key' && cfg.key) {
        headers.Authorization = 'Bearer ' + cfg.key
    }

    const data = await http.post('https://uapis.cn/api/v1/translate/text', {
        to_lang: toLang.uapis,
        text
    }, headers)

    console.log(data);

    // 网络异常时 http.post 返回错误信息字符串
    if (typeof data === 'string') {
        return {
            dst: '错误: ' + data,
            src: text
        }
    }

    if (data.error) {
        return {
            dst: '错误: ' + data.error,
            src: text
        }
    }

    if (data.message) {
        return {
            dst: '错误: ' + data.message,
            src: text
        }
    }

    if (data.translate) {
        return {
            dst: data.translate,
            src: text
        }
    }

    return {
        dst: '错误: 翻译失败',
        src: text
    }
}
