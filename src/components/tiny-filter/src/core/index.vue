<template>
  <div class="amazing-filter-wrapper">
    <el-form
      ref="FormRef"
      size="mini"
      inline
      :model="model"
      :class="{ 'need-error-msg': isShowVerifyErrorMsg && isShowExtFilter }"
      :show-message="isShowVerifyErrorMsg"
      :rules="rules"
      :label-width="`${labelWidth}px`"
      @validate="handleValidate"
    >
      <div class="base-filter-wrapper">
        <el-form-item
          v-for="vnodeConfig in filterSchema"
          :key="Array.isArray(vnodeConfig.key) ? renameKey(vnodeConfig.key) : vnodeConfig.key"
          :prop="Array.isArray(vnodeConfig.key) ? renameKey(vnodeConfig.key) : vnodeConfig.key"
          :label="`${vnodeConfig.label}`"
          :style="{ width: `${(vnodeConfig.col || getCol(vnodeConfig)) * extWidthNum}px` }"
        >
          <component
            :is="RenderFactory"
            :modelValue="
              model[Array.isArray(vnodeConfig.key) ? renameKey(vnodeConfig.key) : vnodeConfig.key]
            "
            @update:modelValue="onUpdateModelValue"
            :config="vnodeConfig"
          />
        </el-form-item>

        <filter-button
          :is-show-ext-filter="isShowExtFilter"
          :len="filterSchema.length"
          :base-has="baseIndex"
          @query="handleQueryAction"
          @reset="handleResetForm"
          @expand="handleCollapseStatus"
        />
      </div>
    </el-form>
  </div>
</template>
<script lang="ts">
  import {
    defineComponent,
    watch,
    reactive,
    ref,
    Ref,
    onMounted,
    onUnmounted,
    computed,
    provide
  } from "vue"
  import { getCol, dateFormat, renameKey, setKeyListValue } from "./methods"
  import { FormItemConfig, FormItemType, Options } from "../types/index"

  import dayjs from "dayjs"
  import RenderFactory from "../render/render-dispatcher.vue"

  import FilterButton from "../render/button-render.vue"
  export default defineComponent({
    name: "Form",
    components: {
      FilterButton,
      RenderFactory
    },
    props: {
      model: {
        required: true,
        type: Object
      },
      schema: {
        required: true,
        type: Array
      },
      isShowVerifyErrorMsg: {
        required: false,
        type: Boolean,
        default: false
      },
      /* form-item 列宽 */
      colWidth: {
        required: false,
        type: Number,
        default: 190
      }
    },
    emits: ["change", "onValidate", "query", "negativeAllDone", "allDone"],
    setup(props, context) {
      /* ------ 整个表单挂载后的ref */
      const FormRef: Ref<any> = ref(null)
      const modelProxy = reactive({ ...props.model })
      provide("model", modelProxy)
      let FormProxy = null

      /* ------ 数据区 */
      /* v-model 双向绑定数据 */
      let filter: FormItemType | Record<string, never> = reactive({})
      /* filter的配置 */
      let filterSchema = []
      /* base 行换行标记 */
      const baseIndex: Ref<number> = ref(3)
      /* 用于数组类型的key值 */
      let mappingList: Record<string, any> = reactive({})
      /* 表单查询不需要用到的中间key值 */
      let notNeedKey: Array<string> = reactive([])
      /* 扩展按钮区域是否显示 */
      const isShowExtFilter: Ref<boolean> = ref(true)
      /* label宽度 */
      let maxLabelWidth: Ref<string> = ref("")
      /* 表单校验规则 */
      let rules: Record<string, any> = reactive({})
      /* 所有的options，select，checkboxGroup ，radioGroup */
      const optionsMap: Record<string, Array<Options>> = reactive({})
      /* provide 向下层注入 */
      provide("optionsMap", optionsMap)
      /* 默认的labelwidth，不直接使用是因为 el-form-item 已被extWidthNum定宽，需要动态计算最终的 useLabelWidth */
      let labelWidth = computed(() => {
        return (maxLabelWidth.value.length + 1) * 15
      })
      const extWidthNum = computed(() => {
        /* 展开的筛选条件默认宽度的基数 */
        return labelWidth.value + props.colWidth
      })
      /* ------ 内部函数 */
      function init(): void {
        initFilterConfig()
        initCreateMappingList()
        initAssignRules()
        ininCalcLabelWidth()
        initCollectOptions()
        /* 没有采用统一的监听 filter {deep:true} 是因为无法方便的拿到key */
        initWatchFilter()
      }
      function initFilterConfig(): void {
        /* 将渲染schema额外拷贝一份 */
        props.schema as FormItemConfig
        /* sub task ,决定base行放几个 filter */
        let colSum = 0
        for (let index = 0; index < props.schema.length; index++) {
          const item = props.schema[index]
          const col = item.col || getCol(item)
          colSum += col
          if (colSum === 3) {
            /* 2+1 = 3 || 1 + 1 + 1 = 3  || 3 = 3*/
            baseIndex.value = index === 0 ? 1 : (3 % index) + 2
            return
          } else if (colSum > 3) {
            /* 2 + 2 || 1 + 1 + 2 || 1 + 3 */
            baseIndex.value = (3 % index) + 2
            return
          }
        }
      }
      function initCreateMappingList(): void {
        props.schema.forEach((item: FormItemType) => {
          if (Array.isArray(item.key)) {
            mappingList[renameKey(item.key)] = item.key
            modelProxy[renameKey(item.key)] = setKeyListValue(item)
          }
        })
      }
      function initAssignRules() {
        props.schema.forEach((item: FormItemType) => {
          if (Array.isArray(item.key)) {
            item.rules ? (rules[renameKey(item.key)] = item.rules) : undefined
          } else {
            item.rules ? (rules[item.key] = item.rules) : undefined
          }
        })
      }
      function ininCalcLabelWidth() {
        props.schema.forEach((item: FormItemType) => {
          maxLabelWidth.value =
            item.label.length > maxLabelWidth.value.length ? item.label : maxLabelWidth.value
        })
      }
      function initCollectOptions() {
        /* 往后在修改此 OPTIONS时不需要 emit  update + sync，因为数组是一个引用*/
        const TYPE = ["select", "checkboxGroup", "radioGroup"]
        props.schema.forEach((item: FormItemType) => {
          if (TYPE.includes(item.component as string)) {
            optionsMap[item.key as string] = []
          }
        })
      }
      function initWatchFilter() {
        Object.keys(modelProxy).map((key) => {
          watch(
            () => modelProxy[key],
            (newVal, oldVal) => {
              /* 如果是数组类型的key发生change  */
              if (Object.hasOwnProperty.call(mappingList, key)) {
                let linkKeyArr = mappingList[key]
                /* 遍历派发值 */
                linkKeyArr.forEach((item: string, index: number) => {
                  modelProxy[item] = modelProxy[key][index]
                })
              }
              /* 过滤掉生成的key，不暴露给用户 */
              if (notNeedKey.includes(key)) {
                return
              }
              /* 最后不管怎样都 emit */
              context.emit("change", key, newVal, oldVal, filter)
            }
          )
        })
      }
      function asyncQueueActions() {
        if (window.asyncQueue && window.asyncQueue.length !== 0) {
          /* 消极 all done ，必须所有请求都ok */
          Promise.all(window.asyncQueue).then(() => {
            window.asyncQueue!.length = 0
            context.emit("negativeAllDone", { filter, notNeedKey })
          })
          /* 积极 all done ，所有请求都 ed (结束)就能触发 */
          Promise.allSettled(window.asyncQueue).then(() => {
            window.asyncQueue!.length = 0
            context.emit("allDone", { filter, notNeedKey })
          })
          /* 以上两个 allDone方法，最终都会触发 allSettled 的 allDone 这个方法 */
        } else {
          context.emit("allDone", { filter, notNeedKey })
        }
      }
      function clear() {
        mappingList = reactive({})
        notNeedKey.length = 0
        maxLabelWidth.value = ""
        rules = reactive({})
      }
      /* ------ 模板依赖函数 */
      const handleValidate = (key: string, isPass: boolean, errorMsg: any) => {
        context.emit("onValidate", { key, isPass, errorMsg })
      }
      const handleQueryAction = () => {
        FormProxy.validate((valid: any) => {
          if (valid) {
            context.emit("query", filter, notNeedKey)
          } else {
            isShowExtFilter.value = true
            console.log("error submit!!")
            return false
          }
        })
      }
      const handleResetForm = () => {
        FormProxy.resetFields()
      }
      const handleCollapseStatus = () => {
        isShowExtFilter.value = !isShowExtFilter.value
      }
      const onUpdateModelValue = (newVal, key) => {
        console.log("444")
        modelProxy[key] = newVal
      }
      onMounted(() => {
        FormProxy = FormRef.value
        console.log(FormProxy, props.schema)
        // Form.$el.addEventListener("keyup", (event: KeyboardEvent) => {
        //   event.key === "Enter" && handleQueryAction()
        // })
        // if (props.config && Array.isArray(props.config) && props.config.length !== 0) {
        //   asyncQueueActions()
        // }
      })
      onUnmounted(() => {
        delete window.asyncQueue
      })
      watch(
        () => props.schema,
        (newVal) => {
          clear()
          init()
          if (newVal && Array.isArray(newVal) && newVal.length !== 0) {
            asyncQueueActions()
          }
        }
      )
      return {
        FormRef,
        model: modelProxy,
        filterSchema: props.schema,
        RenderFactory,
        labelWidth,
        extWidthNum,
        baseIndex,
        mappingList,
        notNeedKey,
        isShowExtFilter,
        rules,
        optionsMap,
        init,
        renameKey,
        getCol,
        handleValidate,
        handleQueryAction,
        handleResetForm,
        handleCollapseStatus,
        onUpdateModelValue
      }
    },
    created() {
      this.init()
    }
  })
</script>
<style lang="scss" scoped>
  @import "./data-filter";
</style>
<style lang="scss">
  .start-date > div > span {
    background: #0bda99 !important;
  }
  .end-date > div > span {
    background: #ff3747 !important;
  }
</style>
