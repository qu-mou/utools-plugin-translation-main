import { http } from "../utils";
import Lang from "./lang";

/**
 * MyMemory 翻译（免费，无需 key）
 * 官方文档: https://mymemory.translated.net/doc/spec.php
 * GET https://api.mymemory.translated.net/get?q=<文本>&langpair=<源语言>|<目标语言>
 * 免费匿名额度每日约5000字符，q 最大 500 字节
 */
export default async function mymemory(text: string, srcLang: Lang, toLang: Lang) {
    // 官方文档限制 q 最大 500 字节
    if (new TextEncoder().encode(text).length > 500) {
        return {
            dst: '错误: MyMemory 单次请求最大支持 500 字节',
            src: text
        }
    }

    const data = await http.get('https://api.mymemory.translated.net/get', {
        q: text,
        langpair: srcLang.mymemory + '|' + toLang.mymemory
    })

    console.log(data);

    // 网络异常时 http.get 返回错误信息字符串
    if (typeof data === 'string') {
        return {
            dst: '错误: ' + data,
            src: text
        }
    }

    if (data.responseStatus !== 200) {
        return {
            dst: '错误: ' + (data.responseDetails || '翻译失败'),
            src: text
        }
    }

    if (data.quotaFinished) {
        return {
            dst: '错误: 今日免费额度已用完',
            src: text
        }
    }

    if (data.responseData && data.responseData.translatedText) {
        return {
            dst: data.responseData.translatedText,
            src: text
        }
    }

    return {
        dst: '错误: 翻译失败',
        src: text
    }
}
