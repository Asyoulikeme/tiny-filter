<script lang="ts">
  import { h, defineComponent, ref } from "vue"
  import Input from "./input-render.vue"
  import Select from "./select-render.vue"
  import Picker from "./picker-render.vue"
  import Switch from "./switch-render.vue"
  import RadioGroup from "./radioGroup-render.vue"
  import CheckBoxGroup from "./checkboxGroup-render.vue"
  import CustomFilterItem from "./custom-filter-item-render.vue"

  export default defineComponent({
    name: "RenderDispatcherFactory",
    props: {
      config: {
        type: Object,
        required: true
      },
      modelValue: {
        type: [Object, String, Number, Array, Boolean],
        required: true
      }
    },
    emits: ["update:modelValue"],
    setup(props, context) {
      const COMMON_PROPS = {
        config: props.config,
        modelValue: props.modelValue
      }
      const COMMON_UPDATE_METHOD = {
        "onUpdate:modelValue": (newval: any) => {
          console.log("333", newval)
          context.emit("update:modelValue", newval, props.config.key)
        }
      }
      interface RenderActions {
        [key: string]: any
      }
      let component = ref(null)
      const ACTIONS: RenderActions = {
        input: () => {
          // console.log("%c input","background:red;border-radius:2px; padding-right:12px;color:#ffffff"); console.count("input")
          return h(Input, {
            config: props.config,
            modelValue: props.modelValue,
            ...COMMON_UPDATE_METHOD
          })
        },
        select: () => {
          // console.log("%c select","background:#03a9f4;border-radius:2px;padding-right:12px; color:#ffffff"); console.count("select")
          return h(Select, {
            config: props.config,
            modelValue: props.modelValue,
            ...COMMON_UPDATE_METHOD
          })
        },
        // checkboxGroup: () => {
        //   return h(CheckBoxGroup, { ...COMMON_PROPS, ...COMMON_UPDATE_METHOD })
        // },
        radioGroup: () => {
          return h(RadioGroup, {
            config: props.config,
            modelValue: props.modelValue,
            ...COMMON_UPDATE_METHOD
          })
        },
        picker: () => {
          // console.log("%c picker","background:#999999;border-radius:2px; padding-right:12px;color:#ffffff"); console.count("picker")
          return h(Picker, {
            config: props.config,
            modelValue: props.modelValue,
            ...COMMON_UPDATE_METHOD
          })
        },
        // switch: () => {
        //   return h(Switch, { ...COMMON_PROPS, ...COMMON_UPDATE_METHOD })
        // },
        object: () => {
          /**
           *  如果是组件过来，那么则是作为子组件
           *  组件的直接渲染，响应式绑定不是通过处理input事件，而是处理自定义事件
           *  所以自定义 change 事件传入子组件，
           *  一定要在子组件内部 emit 此注入的 change事件，此处的 render factory 才能代理将值 dispatch 到父级表单
           * */
          return h(CustomFilterItem, { ...COMMON_PROPS, ...COMMON_UPDATE_METHOD })
        }
      }
      const TYPES: string =
        typeof props.config.component === "object" ? "object" : props.config.component
      component.value = ACTIONS[TYPES || "input"]()
      return {
        component
      }
    },
    render() {
      return this.component
    }
  })
</script>
