/// <reference types="vite/client" />

// utools-api-types@2.6.4 未声明 onPluginReady（官方文档《事件 API》中列出），此处补充声明
interface UToolsApi {
  /**
   * 插件应用加载完成后触发，uTools Runtime 会等待 callback 执行完成后再进入插件应用
   * 文档: uTools 官方文档《事件 API》- onPluginReady
   */
  onPluginReady(callback: () => void): void;
}
