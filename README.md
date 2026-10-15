# utools-plugin-translation

uTools 多引擎翻译插件，支持多个翻译接口，可按需配置与扩展。

## 支持平台

按默认优先级排列：

| 平台 | 说明 | 配置要求 |
| --- | --- | --- |
| uapi翻译 | [UApiPro](https://uapis.cn/) 免费翻译接口，源语言自动检测 | 免费模式无需配置；可选填 API Key（`Authorization: Bearer`） |
| MyMemory翻译 | [MyMemory](https://mymemory.translated.net/) 免费翻译记忆库接口 | 无需配置（免费额度约每日 5000 字符，单次最大 500 字节） |
| 微软翻译 | [Azure Translator](https://azure.microsoft.com/zh-cn/products/ai-services/translator/) | 需配置密钥 Key；区域/多服务资源还需填 Region |
| 自定义翻译 | 自定义 API 路径、参数、请求头与返回体解析 | 配置 API 路径即可，支持高级模式 |
| 百度翻译 | [百度翻译开放平台](https://fanyi-api.baidu.com/) | 需配置 AppID 与密钥 |

## 使用方法

1. 在 uTools 中进入本插件（指令：`翻译` / `translation`，或划词翻译）
2. 顶部 Tab 切换翻译平台
3. 左下角「设置」按钮配置对应平台的参数（MyMemory 无需设置）
4. 输入文本自动翻译，支持中文 / 英语 / 日语互译

## 自定义翻译接口配置

- **API 路径**：完整请求地址，支持占位符 `{text}` `{from}` `{to}`（`text` 按 URL 编码）
- **请求方法**：GET / POST
- **参数**：追加为查询参数，值支持占位符
- **高级模式**（可选）：
  - **请求头**：自定义请求头（如 `Authorization: Bearer <api_key>`），值支持占位符
  - **请求体**：POST 时发送的模板，支持占位符；JSON 模板中的 `{text}` 自动做 JSON 转义；留空则不发送请求体
  - **返回体处理方式**：
    - 纯文本：响应整体作为译文
    - JSON 路径提取：点号分隔路径，如 `translated_text`、`responseData.translatedText`、`translations.0.text`
    - 正则匹配提取：第 1 个捕获组为译文（无捕获组时取整个匹配）

语言代码占位符 `{from}` `{to}` 使用 RFC3066 格式（如 `zh-CN` / `en` / `ja`）。

配置保存在 uTools 同步数据库中，会随账号跨设备同步。

## 开发

```bash
npm install
npm run dev    # 开发调试
npm run build  # 类型检查并构建到 dist/
```

构建产物 `dist/` 目录即为插件应用目录，在 [uTools 开发者工具](https://u.tools/) 中加载即可预览与打包。

## License

[GPL-3.0-only](./LICENSE)
