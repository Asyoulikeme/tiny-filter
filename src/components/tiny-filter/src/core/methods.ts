import { FormItemType } from "../types/index"

export function getCol(item: FormItemType) {
  return item.type === "datetimerange" ? 2 : 1
}
/* element ui 的显示以小写为准，此处额外独立出一份 */
export function dateFormat(type: string) {
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
      return "YYYY"
    case "month":
      return "YYYY-MM"
    case "time":
      return "HH:mm:ss"
    default:
      return "YYYY-MM-DD HH:mm:ss"
  }
}
export function setKeyListValue(schemaItem: FormItemType) {
  /* before check */
  if (
    !["daterange", "datetimerange", "time"].includes(schemaItem.type) &&
    typeof schemaItem.component !== "object"
  ) {
    console.warn(
      "请确保你在使用key:Array<string>时：保证FormItemType.type为 daterange、datetimerange、 time<还需element-plus额外的配置 isRange:true>中的任意一个,或者 FormItemType.component 为一个对象(自定义组件使用方式)，否则这将引发一个内部错误"
    )
    throw new Error("使用key:Array<string>时发生错误")
  }
  /* 上面的判断已经能得到只处理以下两种情况了 */
  if (typeof schemaItem.component === "object") {
    return undefined
  } else {
    return []
  }
}

export function renameKey(list: Array<string>) {
  return list.reduce((pre, next) => (pre += next))
}
