import { getCurrentInstance, RendererNode, h, inject } from "vue"
import { ElRadioButton,ElRadio } from "element-plus"
import { Options } from "../types"
export const useRadioGroupOptions = (_ctx: any) => {
  /* 使用该CompositionApi 的组件实例引用 */
  const vm: any = getCurrentInstance()
  /* 初始化时保存的来自vm 上的运行时数据，这些数据应当都是一组引用 */
  const ctx = _ctx
  /* 对顶层数据进行操作 */
  const optionsMap = inject<Record<string, Array<Options>>>("optionsMap")
  /* 接受原始数据，将其格式化后保存到组件上层，并自我维护一份，返回vnode */
  function CREATE_SELECT_OPTIONS_VNODE(source: Array<Record<string, any> | Options>): RendererNode {
    /* 转译mapper */

    if (Object.prototype.hasOwnProperty.call(vm.props.config, "mapper")) {
      /* 本实例存一份 */
      ctx.currentOptions.value = DO_MAPPER_TRANSFER(source)
      /* 顶层组件维护一份 */
      optionsMap![vm.props.config.key] = ctx.currentOptions
    } else {
      /* 本实例存一份 */
      ctx.currentOptions.value = source as Array<Options>
      /* 顶层组件维护一份 */
      optionsMap![vm.props.config.key] = ctx.currentOptions
    }
    /* 构造 el-options VNode */
    const VNodeList: Array<RendererNode> = []
    ctx.currentOptions.value.forEach((item: Record<string, any>, index: number) => {
      VNodeList.push(
        h(vm.props.config.isButton ? ElRadioButton : ElRadio, {
          label: item.value,
          key: index
        },() => item.text)
      )
    })
    ctx.isForceUpdateOptions.value = false
    return VNodeList
  }
  /* 格式化options */
  function DO_MAPPER_TRANSFER(data: Array<Record<string, any>>) {
    if(data.length && Object.keys(data[0]).every((item) => ["text","value"].includes(item))){
      return data
    }
    const newArr: Array<Options> = []
    data.forEach((item: Record<string, any>) => {
      const newObj = {}
      for (const key in vm.props.config.mapper) {
        Object.assign(newObj, { [key]: item[vm.props.config.mapper[key]] })
      }
      newArr.push(newObj as Options)
    })
    return newArr
  }
  /**
   * options 函数方式 resolver，处理与托管options ，并全局上维护一个Promise状态数组
   * 这个函数有一定的危险性，本模块提供一个 Composition Api的方式暴露出顶层函数 OPTIONS_RENDER_ENTRY 供render函数使用，
   * 在组件内部响应式数据受到影响时，render函数会重新调用，也就意味着这个组件也会重新调用，
   * 在本resolver函数中，一般情况下整个tiny-filter组件目标是在此提供一个处理函数，重要的是 resolver函数会执行请求接口的动作
   * 这个代价很大，也不想发生，所以要在函数内部做特殊处理
   */
  function OPTIONS_RESOLVER(executor: (context: any) => void) {
    const OPTIONS_CTX = {
      schema: ctx.config,
      value: ctx.localVal,
      optionsMap: ctx.optionsMap,
      currentOptions: ctx.currentOptions,
      model: ctx.model
    }
    /* 内部提供 resolve */
    const promise = new Promise(async (resolve) => {
      /* 代理执行resolve，若直接暴露resolve给用户使用，则必须使用await来取到该promise的值 */
      /* 若接口的时间过长，那么整个表单的渲染会被卡死，所以使用异步的方式 */
      function resolver(res: Array<Options>, flag: string) {
        ctx.currentOptions.value = res
        if(flag === "update"){
          ctx.isForceUpdateOptions.value = true
        }
        resolve(res)
      }
      /* 用户可能喜欢以同步的方式使用该函数，那么await它，意义并不大，仅仅是标识这个函数的调用性质 */
      await executor({ ...OPTIONS_CTX, resolve: resolver })
      /* 记录请求状态，也是记录了ctx.config.options是否曾经被调用过 */
      ctx.isFetched.value = true
    })
    promise.then(() => {
      ctx.isForceUpdateOptions.value = true
    })

    if (window.asyncQueue) {
      window.asyncQueue.push(promise)
    } else {
      window.asyncQueue = []
      window.asyncQueue.push(promise)
    }
    return CREATE_SELECT_OPTIONS_VNODE(ctx.currentOptions.value)
  }
  function OPTIONS_RENDER_ENTRY() {
    /* 若为数组，直接走render */
    if (Array.isArray(vm.props.config.options)) {
      return CREATE_SELECT_OPTIONS_VNODE(vm.props.config.options)
    }
    /* 若为处理函数，并且该函数未执行过, isFetched === false,走resolver */
    /**
     * !! 注意，到这里也意味着若 ctx.isFetched === true，则options函数永远不会调用第二次
     * 什么情况下需要options重新调用？
     * 当 options 这个引用被修改的时候需要重新调用，并要将 isFetched 置false
     */
    if (typeof vm.props.config.options === "function" && !ctx.isFetched.value) {
      return OPTIONS_RESOLVER(vm.props.config.options)
    }
    /**
     * !! 注意，这个渲染入口仅对用户调用 resolve 后触发渲染options，
     * 此时要求标识 isForceUpdateOptions === true && currentOptions 为最新的 resolve 的值
     */
    if (typeof vm.props.config.options === "function" && ctx.isForceUpdateOptions.value) {
      return CREATE_SELECT_OPTIONS_VNODE(ctx.currentOptions.value)
    }
  }
  return {
    OPTIONS_RENDER_ENTRY
  }
}
