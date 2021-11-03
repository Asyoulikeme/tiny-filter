<script>
import { _PROPS_MERGE } from '../util'
export default {
  name: 'SwitchCheckbox',
  props: {
    config: Object,
    vModel: [String, Number, Boolean]
  },
  data() {
    return {
      localVal: undefined,
      allowableValue: [true, false]
    }
  },
  created() {
    this.localVal = this.vModel
    this.allowableValue = this.config.allowableValue
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

    const PRIVATE_DEFAULT_PROPS = {
      value: that.localVal
    }
    const PUBLIC_DEFAULT_PROPS = {
      clearable: true,
      'true-label': that.allowableValue[0],
      'false-label': that.allowableValue[1]
    }
    this.config.allowableValue ? undefined : (delete PUBLIC_DEFAULT_PROPS['true-label'], delete PUBLIC_DEFAULT_PROPS['false-label'])

    return h('el-checkbox', {
      props: {
        ..._PROPS_MERGE(that.config, PRIVATE_DEFAULT_PROPS, PUBLIC_DEFAULT_PROPS)
      },
      on: {
        input: value => {
          that.localVal = value
        }
      }
    })
  }

}
</script>
