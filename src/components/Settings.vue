<template>
  <el-dialog
    :title="dialogTitle"
    v-model="data.dialogVisible"
    width="80%"
    :before-close="handleClose"
  >
    <!-- 百度翻译 -->
    <template v-if="platform === 'baidu'">
      AppID:
      <el-input v-model="data.baidu.appid" placeholder="请输入AppID"></el-input>
      <br />
      秘钥:
      <el-input v-model="data.baidu.key" placeholder="请输入秘钥"></el-input>
    </template>

    <!-- uapi翻译 -->
    <template v-if="platform === 'uapis'">
      模式:
      <el-select v-model="data.uapis.mode" style="width: 100%">
        <el-option label="免费模式（无需参数）" value="free"></el-option>
        <el-option label="API 密钥模式" value="key"></el-option>
      </el-select>
      <template v-if="data.uapis.mode === 'key'">
        <br />
        API Key（选填，留空则按免费模式请求）:
        <el-input
          v-model="data.uapis.key"
          placeholder="在 uapis.cn 控制台获取"
          show-password
        ></el-input>
      </template>
    </template>

    <!-- 微软翻译 -->
    <template v-if="platform === 'azure'">
      密钥 Key:
      <el-input
        v-model="data.azure.key"
        placeholder="Azure 门户中的密钥（必填）"
        show-password
      ></el-input>
      <br />
      区域 Region（选填）:
      <el-input
        v-model="data.azure.region"
        placeholder="如 eastus；区域/多服务资源必填，全局资源留空"
      ></el-input>
    </template>

    <!-- 自定义翻译 -->
    <template v-if="platform === 'custom'">
      API 路径:
      <el-input
        v-model="data.custom.url"
        placeholder="https://api.example.com/translate，支持 {text} {from} {to}"
      ></el-input>
      <br />
      请求方法:
      <el-select v-model="data.custom.method" style="width: 120px">
        <el-option label="GET" value="GET"></el-option>
        <el-option label="POST" value="POST"></el-option>
      </el-select>
      <br />
      参数（追加为查询参数，值支持 {text} {from} {to}）:
      <div
        v-for="(p, i) in data.custom.params"
        :key="i"
        class="custom-param-row"
      >
        <el-input v-model="p.key" placeholder="参数名"></el-input>
        <el-input
          v-model="p.value"
          placeholder="参数值，如 {text}"
        ></el-input>
        <el-button @click="removeParam(i)">删除</el-button>
      </div>
      <el-button size="small" @click="addParam">+ 添加参数</el-button>
      <br />
      <br />
      高级模式:
      <el-switch v-model="data.custom.advanced"></el-switch>
      <template v-if="data.custom.advanced">
        <br />
        <br />
        请求头（如 API Key，值支持 {text} {from} {to}）:
        <div
          v-for="(h, i) in data.custom.headers"
          :key="'h' + i"
          class="custom-param-row"
        >
          <el-input v-model="h.key" placeholder="请求头名，如 Authorization"></el-input>
          <el-input
            v-model="h.value"
            placeholder="请求头值，如 Bearer sk-xxx"
          ></el-input>
          <el-button @click="removeHeader(i)">删除</el-button>
        </div>
        <el-button size="small" @click="addHeader">+ 添加请求头</el-button>
        <br />
        <br />
        请求体（POST 时发送，支持占位符；留空则不发送请求体）:
        <el-input
          type="textarea"
          :rows="3"
          v-model="data.custom.body"
          placeholder='JSON 模板示例: {"q": "{text}", "from": "{from}", "to": "{to}"}'
        ></el-input>
        <br />
        返回体处理方式:
        <el-select v-model="data.custom.respMode" style="width: 100%">
          <el-option label="纯文本（响应整体作为译文）" value="text"></el-option>
          <el-option label="JSON 路径提取" value="json"></el-option>
          <el-option label="正则匹配提取" value="regex"></el-option>
        </el-select>
        <template v-if="data.custom.respMode === 'json'">
          <br />
          JSON 路径（如 responseData.translatedText、translations.0.text）:
          <el-input
            v-model="data.custom.respPath"
            placeholder="点号分隔，数组下标用数字"
          ></el-input>
        </template>
        <template v-if="data.custom.respMode === 'regex'">
          <br />
          正则表达式（第 1 个捕获组为译文，无捕获组取整个匹配）:
          <el-input
            v-model="data.custom.respRegex"
            placeholder='如 "translatedText":"(.*?)"'
          ></el-input>
        </template>
      </template>
    </template>

    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="save">保存</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { computed, defineComponent, reactive } from "vue";
import { ElMessage } from "element-plus";
import { ApiInfo } from "../api";

export default defineComponent({
  props: {
    platform: String,
  },
  setup(props) {
    const data = reactive({
      dialogVisible: false,
      baidu: {
        appid: "",
        key: "",
      },
      uapis: {
        mode: "free",
        key: "",
      },
      azure: {
        key: "",
        region: "",
      },
      custom: {
        url: "",
        method: "GET",
        params: [] as { key: string; value: string }[],
        advanced: false,
        headers: [] as { key: string; value: string }[],
        body: "",
        respMode: "text",
        respPath: "",
        respRegex: "",
      },
    });

    const platformNames: any = {
      baidu: "百度翻译",
      uapis: "uapi翻译",
      azure: "微软翻译",
      custom: "自定义翻译",
      mymemory: "MyMemory翻译",
    };

    const dialogTitle = computed(
      () => "设置 - " + (platformNames[props.platform || ""] || "翻译")
    );

    const handleClose = (done: () => void) => {
      if (save()) {
        done();
      }
    };

    const show = () => {
      data.dialogVisible = true;
      const p = props.platform;

      if (p === "baidu" && ApiInfo.baidu != null) {
        data.baidu.appid = ApiInfo.baidu.id || "";
        data.baidu.key = ApiInfo.baidu.key || "";
      }

      if (p === "uapis" && ApiInfo.uapis != null) {
        data.uapis.mode = ApiInfo.uapis.mode || "free";
        data.uapis.key = ApiInfo.uapis.key || "";
      }

      if (p === "azure" && ApiInfo.azure != null) {
        data.azure.key = ApiInfo.azure.key || "";
        data.azure.region = ApiInfo.azure.region || "";
      }

      if (p === "custom" && ApiInfo.custom != null) {
        const c = ApiInfo.custom;
        data.custom.url = c.url || "";
        data.custom.method = c.method === "POST" ? "POST" : "GET";
        data.custom.params = Array.isArray(c.params)
          ? c.params.map((x: any) => ({
              key: x.key || "",
              value: x.value || "",
            }))
          : [];
        data.custom.advanced = !!c.advanced;
        data.custom.headers = Array.isArray(c.headers)
          ? c.headers.map((x: any) => ({
              key: x.key || "",
              value: x.value || "",
            }))
          : [];
        data.custom.body = c.body || "";
        data.custom.respMode = c.respMode || "text";
        data.custom.respPath = c.respPath || "";
        data.custom.respRegex = c.respRegex || "";
      }
    };

    const addParam = () => {
      data.custom.params.push({ key: "", value: "" });
    };

    const removeParam = (i: number) => {
      data.custom.params.splice(i, 1);
    };

    const addHeader = () => {
      data.custom.headers.push({ key: "", value: "" });
    };

    const removeHeader = (i: number) => {
      data.custom.headers.splice(i, 1);
    };

    // dbStorage 走结构化克隆，不能传 Vue reactive 代理对象，需转为纯数据
    const save = (): boolean => {
      try {
        const storage = window.utools.dbStorage;
        const p = props.platform;

        if (p === "baidu") {
          storage.setItem("baidu", {
            id: data.baidu.appid,
            key: data.baidu.key,
          });
          ApiInfo.baidu = storage.getItem("baidu");
        } else if (p === "uapis") {
          storage.setItem("uapis", {
            mode: data.uapis.mode,
            key: data.uapis.key,
          });
          ApiInfo.uapis = storage.getItem("uapis");
        } else if (p === "azure") {
          storage.setItem("azure", {
            key: data.azure.key,
            region: data.azure.region,
          });
          ApiInfo.azure = storage.getItem("azure");
        } else if (p === "custom") {
          storage.setItem("custom", {
            url: data.custom.url,
            method: data.custom.method,
            params: data.custom.params
              .filter((x) => x.key)
              .map((x) => ({ key: x.key, value: x.value })),
            advanced: data.custom.advanced,
            headers: data.custom.headers
              .filter((x) => x.key)
              .map((x) => ({ key: x.key, value: x.value })),
            body: data.custom.body,
            respMode: data.custom.respMode,
            respPath: data.custom.respPath,
            respRegex: data.custom.respRegex,
          });
          ApiInfo.custom = storage.getItem("custom");
        }

        data.dialogVisible = false;
        return true;
      } catch (e) {
        ElMessage.error("保存失败: " + (e && e.message ? e.message : e));
        return false;
      }
    };

    return {
      data,
      dialogTitle,
      handleClose,
      show,
      save,
      addParam,
      removeParam,
      addHeader,
      removeHeader,
    };
  },
});
</script>

<style lang="scss" scoped>
.custom-param-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}
</style>
