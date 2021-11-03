<script lang="ts">
  import dayjs from "dayjs"
  import { _PROPS_MERGE,notTransmitPropsForFragment } from "../util"
  import { h, ref, Ref, defineComponent, watch, SetupContext, RendererNode, computed } from "vue"
  import { ElDatePicker,ElTimePicker} from "element-plus"
  import { PickerType } from "../types"
  declare type DateType = Date | string | number | undefined
  declare type PropsCover = Readonly<
    {} & {
      config: PickerType
      modelValue: string | number | DateType[] | undefined
    }
  >

  export default {
    name: "Picker",
    props: {
      config: {
        required: true,
        type: Object
      },
      modelValue: {
        required: true,
        type: [String, Array, Number]
      }
    },
    emits: ["update:modelValue"],
    setup(props: PropsCover, context: SetupContext) {
      let localVal = ref(props.modelValue)
      /* 用于在时间表盘中选中时做标记 */
      let onPickMark_maxDate: Ref<DateType> = ref(undefined)
      let onPickMark_minDate: Ref<DateType> = ref(undefined)
      /* 用于帮助picker记录当前的选点时间 */
      let fakerLocalVal: Ref<DateType> = ref(undefined)
      /* 用于 range 类型的picker进行日期限制 */
      let limitPickerOptions = {
        onPick: ({ maxDate, minDate }: Record<string, DateType>) => {
          onPickMark_maxDate.value = maxDate
          onPickMark_minDate.value = minDate
          if (!maxDate) {
            fakerLocalVal.value = minDate
          }
        },
        disabledDate: (time: DateType) => {
          /* 魔法2：有最大值和最小值时证明是已经选择了两个点 需要放开所有禁用 */
          if (onPickMark_maxDate.value && onPickMark_minDate.value) {
            return false
          }
          /* 魔法1：禁掉 limit区间外的时间可选区域 */
          /* 该函数中的 ?. 可选链操作符其实都是确定的，因为仅在config中具有limit时，该limitPickerOptions才会启用  */
          const targetTime = fakerLocalVal.value
          const d_value = props.config?.timeBetween ? 1 : 0
          if (targetTime) {
            const minTime = dayjs(targetTime).subtract(props.config?.limit - d_value, "day")
            const maxTime = dayjs(targetTime).add(props.config?.limit - d_value, "day")
            return dayjs(time).isBefore(minTime) || dayjs(time).isAfter(maxTime)
          } else {
            return false
          }
        }
      }
      /* 响应式数据双向流 */
      watch(
        () => props.modelValue,
        (newVal) => {
          localVal.value = newVal
        }
      )

      watch(localVal, (newVal) => {
        /* timeBetween 处理 */
        if (
          props.config.type === "datetimerange" &&
          props.config.timeBetween &&
          Array.isArray(newVal) &&
          newVal.length === 2
        ) {
          newVal[0] = dayjs(newVal[0]).format("YYYY-MM-DD 00:00:00")
          newVal[1] = dayjs(newVal[1]).format("YYYY-MM-DD 23:59:59")
        }

        /**
         * 数组range类型 数据填充处理
         * !当range类型的新值为null时，不能赋值新的数组给 localVal，否则引起format -> invaild Date
         * @解决方案  [] 新的引用
         * */
        if (
          props.config.component === "picker" &&
          ["daterange", "datetimerange", "time"].includes(props.config.type) &&
          !newVal
        ) {
          localVal.value = []
          context.emit("updatevModel", localVal.value)
          return
        }
        /* 魔法3：如果选择的日期是同一天 且有属性 sameDayTimeBetween 那么自动 timeBetween */
        /* dayjs(xx).date() 此处不能使用这个函数来判断天是否相同，因为这样的话用户就不能手动更改表盘上面的时间了 */
        if (
          props.config.type === "datetimerange" &&
          props.config.sameDayTimeBetween &&
          newVal &&
          Array.isArray(newVal) &&
          newVal.length === 2 &&
          dayjs(newVal[0]).valueOf() === dayjs(newVal[1]).valueOf()
        ) {
          newVal[0] = dayjs(newVal[0]).format("YYYY-MM-DD 00:00:00")
          newVal[1] = dayjs(newVal[1]).format("YYYY-MM-DD 23:59:59")
        }
        /* 新值无问题时直接 emit 更新 */
        context.emit("update:modelValue", newVal)
      })

      const _DATE_FORMAT = () => {
        const { type } = props.config
        switch (type) {
          case "date":
            return "YYYY-MM-DD"
          case "daterange":
            return "YYYY-MM-DD"
          case "datetime":
            return "YYYY-MM-DD HH:mm:ss"
          case "datetimerange":
            return "YYYY-MM-DD HH:mm:ss"
          case "year":
            return "yyyy"
          case "month":
            return "yyyy-MM"
          case "time":
            return "HH:mm:ss"
          default:
            return "YYYY-MM-DD HH:mm:ss"
        }
      }
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
      /* 预设属性，内部表单属性优先级最低，可被传入配置覆盖 */
      const PUBLIC_DEFAULT_PROPS = {
        type: props.config.type,
        clearable: true,
        placeholder: RESET_PLACEHOLDER.value,
        "start-placeholder": "开始时间",
        "end-placeholder": "结束时间",
        format: _DATE_FORMAT(),
        class: {
          "shorter-datetime-picker": props.config.type === "datetime",
          "same-width-for-date": ["date", "year", "month", "week"].includes(props.config.type)
        }
      }
      /* 当 props.config 发生改变时，触发属性重新计算 */
      const final_attrs = computed(() => {
        return _PROPS_MERGE(props.config, PRIVATE_DEFAULT_PROPS, PUBLIC_DEFAULT_PROPS)
      })
      return {
        final_attrs,
        localVal
      }
    },
    render(_ctx: RendererNode) {
      const picker = _ctx.config.type !== "time" ? ElDatePicker : ElTimePicker
      return h(picker, {
        ...notTransmitPropsForFragment(_ctx.final_attrs,picker.props),
        modelValue: _ctx.localVal,
        "onUpdate:modelValue": (value: string) => {
          _ctx.localVal = value
        }
      })
    }
  }
</script>
