<script>
import { _PROPS_MERGE, _WAIT_PROMISE_FULFILLED,_DO_MAPPER_TRANSFER } from '../util'
export default {
  name: 'CheckboxGroup',
  props: {
    config: Object,
    vModel: Array,
    attrs: Object
  },
  data() {
    return {
      localVal: [],
      /* 用于保存 请求获取到的 select 的 options */
      remoteData: [],
      /* 在响应式的render函数中 确保只会请求一次 */
      singleFetchCount: 0
    }
  },
  created() {
    this.localVal = this.vModel
  },
  watch: {
    vModel(newval) {
      this.localVal = newval
    },
    localVal(newval) {
      this.$emit('updatevModel', newval)
    }
  },
  render(h) {
    const that = this
    const _ITEM = (source) => {
      const data = Object.prototype.hasOwnProperty.call(that.config,"mapper") ? _DO_MAPPER_TRANSFER.call(that,source) : source
      that.attrs.OPTIONS[that.config.key] = data
      // that.$emit("update:attrs",that.attrs)
      const VNodeList = []
      data.forEach((item, index) => {
        VNodeList.push(
          h(that.config.isButton ? 'el-checkbox-button' : 'el-checkbox',
            {
              props: {
                label: item.value
                // trueLabel:item.value 不能设置真实值，否则无法拿到 事件的 更新
              }
            },
            [
              item.text
            ]
          )
        )
      })
      return VNodeList
    }
    const PRIVATE_DEFAULT_PROPS = {
      value: that.localVal
    }
    const PUBLIC_DEFAULT_PROPS = {

    }
    return h('el-checkbox-group',
      {
        props: {
          ..._PROPS_MERGE(that.config, PRIVATE_DEFAULT_PROPS, PUBLIC_DEFAULT_PROPS)
        },
        on: {
          change: (newVal, ev) => {
            /* 处理 checkbox group的数据的操作不应该像官方说的那样在 change 事件中，源码中是走到了 input事件 */
          },
          input: (newVal) => {
            /* 此处才是正确处理数据之处 */
            that.localVal = newVal
          }
        }

      },
      [
        ...(Array.isArray(that.config.options)
          ? _ITEM(that.config.options)
          : typeof that.config.options === 'function' ? _WAIT_PROMISE_FULFILLED.call(that, that.config.options, _ITEM) : [])
      ]
    )
  }

}
</script>
