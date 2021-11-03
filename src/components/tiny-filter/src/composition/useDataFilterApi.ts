import { reactive, ref } from "vue"
import { FormItemConfig, FormItemType, Options } from "../types/index"

export const useDataFilterApi = () => {
  /* v-model 双向绑定数据 */
  const filter = reactive<FormItemType | Record<string, never>>({})
  /* filter的配置 */
  const filterConfig = reactive<FormItemConfig>([])
  /* base 行换行标记 */
  const baseIndex = ref(3)
  /* 用于数组类型的key值 */
  const mappingList = reactive<Record<string, any>>({})
  /* 表单查询不需要用到的中间key值 */
  const notNeedKey = reactive<Array<string>>([])
  /* 扩展按钮区域是否显示 */
  const isShowExtFilter = ref(true)
  /* label宽度 */
  const maxLabelWidth = ref(0)
  /* 表单校验规则 */
  const rules = reactive<Record<string, any>>({})
  /* 所有的options，select，checkboxGroup ，radioGroup */
  const OPTIONS = reactive<Record<string, Array<Options>>>({})

  return {
    filter,
    filterConfig,
    baseIndex,
    maxLabelWidth,
    mappingList,
    notNeedKey,
    isShowExtFilter,
    rules,
    OPTIONS
  }
}
