<script lang="ts">
  import { defineComponent, Ref, h, toRef, watch } from "vue"
  export default defineComponent({
    name: "CustomFilterItem",
    props: {
      config: {
        type: Object,
        required: true
      },
      modelValue: {
        type: [String, Number, Array, Boolean],
        required: true
      }
    },
    emits: ["update:modelValue"],
    setup(props, context) {
      const localVal: Ref<any> = toRef(props, "modelValue")
      watch(
        () => props.modelValue,
        (newVal) => {
          localVal.value = newVal
        }
      )
      watch(localVal, (newVal) => {
        context.emit("update:modelValue", newVal)
      })
      return {
        localVal
      }
    },
    render() {
      return h(this.config.component, {
        modelValue: this.localVal,
        ...this.config.props,
        placeholder: this.config.label,
        "onUpdate:modelValue": (value: any) => {
          this.localVal = value
        }
      })
    }
  })
</script>
