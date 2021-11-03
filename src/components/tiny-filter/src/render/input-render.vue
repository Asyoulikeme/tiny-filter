<script lang="ts">
  import { defineComponent, ref, Ref, h, RendererNode, watch, computed ,getCurrentInstance} from "vue"
  import { ElInput } from "element-plus"
  import { _PROPS_MERGE } from "../util"
  export default defineComponent({
    name: "Input",
    components: {
      ElInput
    },
    props: {
      config: {
        type: Object,
        required: true
      },
      modelValue: {
        type: [String, Number],
        required: true
      }
    },
    emits: ["update:modelValue"],
    setup(props, context) {
      let localVal: Ref<string | number> = ref(props.modelValue)
      /* 重设placeholder */
     
      const RESET_PLACEHOLDER = computed(() => {
        const suffix = props.config.label.slice(-1)
        const has_suffix = [":", "："].includes(suffix)
        if (has_suffix) {
          return `请输入${props.config.label.slice(0, props.config.label.length - 1)}`
        } else {
          return `请输入${props.config.label}`
        }
      })
      /* 私有属性优先级最高，不可更改 */
      const PRIVATE_DEFAULT_PROPS = {}
      /* 内部表单属性优先级最低，可被传入配置覆盖 */
      const PUBLIC_DEFAULT_PROPS = {
        clearable: true,
        placeholder: RESET_PLACEHOLDER.value
      }
      /* 当 props.config 发生改变时，触发属性重新计算 */
      const final_attrs = computed(() => {
        return _PROPS_MERGE(props.config, PRIVATE_DEFAULT_PROPS, PUBLIC_DEFAULT_PROPS)
      })
      /* 双向数据流，数据流入 */
      watch(
        () => props.modelValue,
        (newVal) => {
          localVal.value = newVal
        }
      )
      /* 双向数据流，数据流出 */
      watch(localVal, (newVal) => {
        context.emit("update:modelValue", newVal)
      })
      return {
        final_attrs,
        localVal
      }
    },
    render(_ctx: RendererNode) {
      return h(ElInput, {
        ..._ctx.final_attrs,
        modelValue: _ctx.localVal,
        "onUpdate:modelValue": (value: string) => {
          _ctx.localVal = value.trim()
        }
      })
    }
  })
</script>
