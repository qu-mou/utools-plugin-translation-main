import { http } from "../utils";
import ApiInfo from "./api-info";
import Lang from "./lang";

/**
 * 微软翻译 (Azure Translator)
 * 官方文档: https://learn.microsoft.com/en-us/azure/ai-services/translator/text-translation/reference/v3/translate
 * POST https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=<源>&to=<目标>
 * 请求头:
 * - Ocp-Apim-Subscription-Key: <密钥>（必需）
 * - Ocp-Apim-Subscription-Region: <区域>（区域/多服务资源必需，全局资源可省略）
 *   （官方文档《Authentication and authorization in Azure Translator》）
 * 请求体: [{ "text": "待译文本" }]
 * 返回: [{ translations: [{ text: <译文> }] }]
 */
export default async function azure(text: string, srcLang: Lang, toLang: Lang) {
    const cfg = ApiInfo.azure
    if (!cfg || !cfg.key) {
        return {
            dst: '错误: 未配置微软翻译密钥, 请在设置中配置',
            src: text
        }
    }

    const headers: any = {
        'Content-Type': 'application/json; charset=UTF-8',
        'Ocp-Apim-Subscription-Key': cfg.key
    }
    if (cfg.region) {
        headers['Ocp-Apim-Subscription-Region'] = cfg.region
    }

    const url = 'https://api.cognitive.microsofttranslator.com/translate'
        + '?api-version=3.0'
        + '&from=' + srcLang.azure
        + '&to=' + toLang.azure

    const data = await http.post(url, [{ text }], headers)

    console.log(data);

    // 网络异常时 http.post 返回错误信息字符串
    if (typeof data === 'string') {
        return {
            dst: '错误: ' + data,
            src: text
        }
    }

    // Azure 错误响应: { error: { code, message } }
    if (data.error) {
        return {
            dst: '错误: ' + (data.error.message || data.error.code || '翻译失败'),
            src: text
        }
    }

    if (Array.isArray(data) && data[0] && data[0].translations && data[0].translations[0]) {
        return {
            dst: data[0].translations[0].text,
            src: text
        }
    }

    return {
        dst: '错误: 翻译失败',
        src: text
    }
}
