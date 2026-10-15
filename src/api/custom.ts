import { http } from "../utils";
import ApiInfo from "./api-info";
import Lang from "./lang";

/**
 * 自定义翻译接口
 * 配置项（保存于 dbStorage "custom"）:
 * - url: API 路径，支持占位符 {text} {from} {to}（text 按 URL 编码）
 * - method: GET / POST
 * - params: 查询参数列表 [{ key, value }]，value 支持占位符
 * - advanced: 高级模式开关
 * - headers: 自定义请求头列表 [{ key, value }]，value 支持占位符（如 API Key）
 * - body: 高级模式-请求体模板，支持占位符；JSON 模板中的 {text} 会做 JSON 转义
 * - respMode: 高级模式-返回体处理方式 text(纯文本) / json(JSON路径) / regex(正则)
 * - respPath: JSON 路径，如 responseData.translatedText、translations.0.text
 * - respRegex: 正则表达式，第 1 个捕获组为译文（无捕获组时取整个匹配）
 *
 * 语言代码占位符 {from} {to} 使用 RFC3066 格式（如 zh-CN / en / ja）
 */

// 单次扫描替换，避免插入内容中的占位符被二次替换
function fillPlaceholders(template: string, text: string, from: string, to: string, encode: boolean = false) {
    const textValue = encode ? encodeURIComponent(text) : text
    return template.replace(/\{text\}|\{from\}|\{to\}/g, (m) => {
        if (m === '{text}') return textValue
        if (m === '{from}') return from
        return to
    })
}

// JSON 模板中的文本需转义（去掉 JSON.stringify 首尾引号），纯文本模板原样插入
function fillBody(template: string, text: string, from: string, to: string) {
    const isJson = /^\s*[\[{]/.test(template)
    const textValue = isJson ? JSON.stringify(text).slice(1, -1) : text
    return template.replace(/\{text\}|\{from\}|\{to\}/g, (m) => {
        if (m === '{text}') return textValue
        if (m === '{from}') return from
        return to
    })
}

// 按点号路径取值，支持数组下标（如 translations.0.text）
function extractByPath(obj: any, path: string): string | null {
    if (!path) return null
    let cur: any = obj
    for (const seg of path.split('.')) {
        if (cur == null) return null
        cur = cur[seg]
    }
    if (typeof cur === 'string') return cur
    if (Array.isArray(cur) && cur.length > 0 && typeof cur[0] === 'string') {
        return cur[0]
    }
    return null
}

function errorResult(msg: string, text: string) {
    return {
        dst: '错误: ' + msg,
        src: text
    }
}

export default async function custom(text: string, srcLang: Lang, toLang: Lang) {
    const cfg = ApiInfo.custom
    if (!cfg || !cfg.url) {
        return errorResult('未配置自定义接口, 请在设置中配置 API 路径', text)
    }

    const from = srcLang.google
    const to = toLang.google

    const url = fillPlaceholders(cfg.url, text, from, to, true)

    const params: any = {}
    if (Array.isArray(cfg.params)) {
        for (const p of cfg.params) {
            if (p && p.key) {
                params[p.key] = fillPlaceholders(p.value || '', text, from, to, false)
            }
        }
    }

    const method = cfg.method === 'POST' ? 'POST' : 'GET'
    const headers: any = {}
    let bodyData: any = undefined

    // 高级模式自定义请求头（如 Authorization），支持占位符
    if (cfg.advanced && Array.isArray(cfg.headers)) {
        for (const h of cfg.headers) {
            if (h && h.key) {
                headers[h.key] = fillPlaceholders(h.value || '', text, from, to, false)
            }
        }
    }

    if (method === 'POST' && cfg.advanced && cfg.body) {
        const filled = fillBody(cfg.body, text, from, to)
        const trimmed = filled.trim()
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            try {
                bodyData = JSON.parse(filled)
            } catch (e) {
                return errorResult('请求体模板不是合法 JSON, 请检查', text)
            }
        } else {
            bodyData = filled
            if (!headers['Content-Type'] && !headers['content-type']) {
                headers['Content-Type'] = 'text/plain;charset=utf-8'
            }
        }
    }

    const res: any = await http.request({
        url,
        method,
        params,
        data: bodyData,
        headers
    })

    console.log(res);

    if (!res.ok) {
        const d = res.data
        const detail = typeof d === 'string' ? d
            : (d && (d.message || d.error)) ? (d.message || d.error)
            : (d ? JSON.stringify(d) : '')
        return errorResult('请求失败' + (res.status ? ' (' + res.status + ')' : '') + (detail ? ': ' + detail : ''), text)
    }

    const data = res.data
    const mode = cfg.advanced && cfg.respMode ? cfg.respMode : 'text'

    if (mode === 'json') {
        let obj = data
        if (typeof data === 'string') {
            try {
                obj = JSON.parse(data)
            } catch (e) {
                return errorResult('返回体不是合法 JSON, 无法按路径提取', text)
            }
        }
        const path = cfg.respPath || ''
        if (!path) {
            return errorResult('未配置返回体 JSON 路径, 请在设置中配置', text)
        }
        const dst = extractByPath(obj, path)
        if (dst == null) {
            return errorResult('未在返回体中找到译文 (路径: ' + path + ')', text)
        }
        return { dst, src: text }
    }

    if (mode === 'regex') {
        const pattern = cfg.respRegex || ''
        if (!pattern) {
            return errorResult('未配置正则表达式, 请在设置中配置', text)
        }
        const raw = typeof data === 'string' ? data : JSON.stringify(data)
        let m: RegExpMatchArray | null = null
        try {
            m = raw.match(new RegExp(pattern))
        } catch (e) {
            return errorResult('正则表达式无效', text)
        }
        if (!m) {
            return errorResult('正则未匹配到返回内容', text)
        }
        const dst = m[1] != null ? m[1] : m[0]
        return { dst, src: text }
    }

    // 纯文本模式（基础模式默认）：响应整体作为译文
    const dst = typeof data === 'string' ? data : JSON.stringify(data)
    return { dst, src: text }
}
