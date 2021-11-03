
declare interface NativeHTMLAttrubute {
  [key: string]: any
}
declare interface CustomProps {
  [key: string]: any
}
type AsyncValidatorConfig = any

declare interface BaseType{
  /**
   * form-item label
   * @default ""
   */
  label: string
  /**
   * form-item field
   * @default ""
   */
  key: string | Array<string>
  /**
   * form-item type
   * @default ""
   */
  component?: "input" | "select" | "picker" | "switch" | "checkboxGroup" | "radioGroup"
  /**
   * form-item default value
   */
  default?: any
  /**
   * form-item Any Vaild Async Validator Config [AsyncValidator](https://github.com/yiminghe/async-validator)
   */
  rules?: Array<AsyncValidatorConfig>
  /**
   * form-item dom native attribute
   */
  attrs?: NativeHTMLAttrubute
  /**
   * form-item props
   */
  props?: CustomProps
  /**
   * form-item Cross column
   */
  col?: number
  /**
   * form-item Any Vaild ElementPlus Component Config
   */
  [AnyVaildElementPlusComponentConfig: string]: any
}

export declare interface InputType extends BaseType {
  component?: "input"
}
export declare interface Options {
  text: string
  value: any
}
export declare interface OptionsMapper {
  text: string
  value: string
}
declare type ReactiveModel = {
  [key: string]: any
}
declare type WATCH_UPDATE_BY_FLAG = "update"
declare interface OptionsContext {
  schema: FormItemConfig,
  value: unknown,
  optionsMap: Record<string,Array<Options>>
  currentOptions: Array<Options>,
  model: ReactiveModel,
  resolve: (options: Array<Options>, flag?: WATCH_UPDATE_BY_FLAG) => void
}
export declare interface SelectType extends BaseType {
  component: "select"
  options: (ctx:OptionsContext) => void
  mapper?: OptionsMapper
}
export declare interface CheckboxGroupType extends BaseType {
  component: "checkboxGroup"
  options: (() => Array<Options>) | Promise<Array<Options>> | Array<Options>
  mapper?: OptionsMapper
  /**
   * set button style
   * @default false
   */
  isButton?: boolean
}

export declare interface RadioGroupType extends BaseType {
  component: "radioGroup"
  options: (() => Array<Options>) | Promise<Array<Options>> | Array<Options>
  mapper?: OptionsMapper
}
export declare interface PickerType extends BaseType {
  key: string | Array<string>
  component: "picker"
  type: "date" | "daterange" | "datetime" | "datetimerange" | "year" | "month" | "time"
  /**
   * if [type] surffix is range,limit will take effect, Unit:days
   * same as element-plus picker-options.disabledDate
   */
  limit?: number
  /**
   * if [type] surffix is range,timeBetween will take effect,Format time as startTime(00:00:00) ,and endTime(23:59:59)
   * @default false
   */
  timeBetween?: boolean
  /**
   * if [type] surffix is range,sameDayTimeBetween will take effect,Format the same day of time as startTime(00:00:00) ,and endTime(23:59:59)
   * @default false
   */
  sameDayTimeBetween?: boolean
}

export declare interface SwitchType extends BaseType {
  component: "switch"
  allowableValue: Array<any>
}

export declare type FormItemConfig =
  | Array<InputType | SelectType | RadioGroupType | CheckboxGroupType | PickerType | SwitchType>

export declare type FormItemType =
  | InputType
  | SelectType
  | RadioGroupType
  | CheckboxGroupType
  | PickerType
  | SwitchType

declare global {
  interface Window {
    asyncQueue?: Array<Promise<any>>
  }
}
