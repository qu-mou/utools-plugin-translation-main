<template>
  <el-tabs v-model="activeName" @tab-click="handleClick">
    <el-tab-pane label="uapi翻译" name="uapis" />
    <el-tab-pane label="MyMemory翻译" name="mymemory" />
    <el-tab-pane label="微软翻译" name="azure" />
    <el-tab-pane label="自定义翻译" name="custom" />
    <el-tab-pane label="百度翻译" name="baidu" />
  </el-tabs>
  <translate-box :platform="activeName" ref="tBox" />
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import TranslateBox from "./components/TranslateBox.vue";
import { ApiInfo } from "./api";
export default defineComponent({
  components: {
    TranslateBox,
  },
  setup() {
    const utools = window.utools;
    utools.onPluginReady(() => {
      console.log("插件装配完成，已准备好");
      ApiInfo.uapis = utools.dbStorage.getItem("uapis");
      ApiInfo.azure = utools.dbStorage.getItem("azure");
      ApiInfo.custom = utools.dbStorage.getItem("custom");
      ApiInfo.baidu = utools.dbStorage.getItem("baidu");
      console.log(ApiInfo.uapis, ApiInfo.azure, ApiInfo.custom, ApiInfo.baidu);
    });
    const activeName = ref("uapis");
    const tBox = ref();
    const handleClick = () => {
      tBox.value.onChange("", false);
    };
    return {
      activeName,
      tBox,
      handleClick,
    };
  },
});
</script>
