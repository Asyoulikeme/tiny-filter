<script lang="ts">
  import { ElRadioGroup } from "element-plus"
  import { _PROPS_MERGE } from "../util"
  import { useRadioGroupOptions } from "../util/useRadioGroupOptions"
  import {
    defineComponent,
    watch,
    Ref,
    ref,
    reactive,
    h,
    computed,
    RendererNode,
    inject
  } from "vue"
  export default defineComponent({
    name: "RadioGroup",
    components: {
      ElRadioGroup
    },
    props: {
      config: {
        type: Object,
        required: true
      },
      modelValue: {
        type: [String, Number, Boolean, Array, Object],
        required: true
      }
    },
    emits: ["update:modelValue"],
    setup(props, context) {
      /* 基础性定义 */
      let localVal: Ref<unknown> = ref(props.modelValue)
      const currentOptions = ref([])
      const isFetched: Ref<boolean> = ref(false)
      const isForceUpdateOptions: Ref<boolean> = ref(false)

      const { OPTIONS_RENDER_ENTRY } = useRadioGroupOptions({
        value: localVal,
        currentOptions,
        isFetched,
        isForceUpdateOptions,
        schema: props.config,
        model: inject("model"),
        optionsMap: inject("optionsMap")
      })
      const OPTIONS = ref(OPTIONS_RENDER_ENTRY())
      /* 重设placeholder */
      const suffix = props.config.label.slice(-1)
      const has_suffix = [":", "："].includes(suffix)
      const RESET_PLACEHOLDER = computed(() => {
        if (has_suffix) {
          return `请输入${props.config.label.slice(0, props.config.label.length - 1)}`
        } else {
          return `请输入${props.config.label}`
        }
      })
      /* 私有属性优先级最高，不可更改 */
      const PRIVATE_DEFAULT_PROPS = {}
      /* 预设配置，内部表单属性优先级最低，可被传入配置覆盖 */
      const PUBLIC_DEFAULT_PROPS = {
        clearable: true,
        "collapse-tags": true,
        filterable: currentOptions.value.length > 7,
        multiple: props.config.multiple,
        placeholder: RESET_PLACEHOLDER.value
      }

      /* 响应性 Api */

      /* 当 props.config 发生改变时，触发属性重新计算 */
      const final_attrs = computed(() => {
        return _PROPS_MERGE(props.config, PRIVATE_DEFAULT_PROPS, PUBLIC_DEFAULT_PROPS)
      })
      /* 正向数据流 */
      watch(
        () => props.modelValue,
        (newVal) => {
          localVal.value = newVal
        }
      )
      /* 逆向数据流 */
      watch(localVal, (newVal) => {
        context.emit("update:modelValue", newVal)
      })
      /* options函数发生改变时候，将isFetched重置，并重新计算options */
      watch(
        () => props.config.options,
        () => {
          isFetched.value = false
          OPTIONS.value = OPTIONS_RENDER_ENTRY()
        }
      )
      /* 强制更新标识，当用户resolve后调用重新计算options */
      watch(isForceUpdateOptions, (newVal: boolean, oldVal: boolean) => {
        if (newVal) {
          OPTIONS.value = OPTIONS_RENDER_ENTRY()
        }
      })
      return {
        localVal,
        currentOptions,
        isFetched,
        isForceUpdateOptions,
        final_attrs,
        OPTIONS
      }
    },
    render(_ctx: RendererNode) {
      return h(
        ElRadioGroup,
        {
          ..._ctx.final_attrs,
          modelValue: _ctx.localVal,
          "onUpdate:modelValue": (
            value: string | number | Array<any> | Record<string, any>
          ) => {
            this.localVal = value
          }
        },
        () => _ctx.OPTIONS
      )
    }
  })
</script>
