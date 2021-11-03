/*
 * @Description: all in filter， by yuwei
 * @Version:
 * @Author: yuwei
 * @Date: 2020-09-29 17:18:47
 * @LastEditTime: 2020-10-05 10:31:03
 */

export function _deepClone(target) {
  let result
  if (typeof target === 'object') {
    if (Array.isArray(target)) {
      result = [] // 将result赋值为一个数组，并且执行遍历
      for (const i in target) {
        // 递归克隆数组中的每一项
        result.push(_deepClone(target[i]))
      }
    } else if (target === null) {
      result = null
    } else if (target.constructor === RegExp) {
      result = target
    } else {
      result = {}
      for (const i in target) {
        result[i] = _deepClone(target[i])
      }
    }
  } else {
    result = target
  }
  return result
}

export function toFormData(params) {
  const formData = new FormData()
  Object.keys(params).forEach(key => {
    formData.append(key, params[key])
  })
  return formData
}

export function toImitateFormData(params) {
  return new URLSearchParams(params).toString()
}
/**
 * @description 两字符串中找前置公共串
 * @param {string}
 * @return {index,undefined}
 */

export function foundDiffIndex(a, b) {
  const arr1 = a.split('')
  const arr2 = b.split('')

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return i
    }
  }
  return undefined
}

/**
 * @data 需要转换的数据
 */
export function _DO_MAPPER_TRANSFER(data) {
  /**
   * @this 请在调用该方法的时候改变一下this的指向
   * mapper 中的 key - value 遵循以下规则：
   * @key 为接口返回的对象 ，<String>
   * @value 为需要映射成的 text or value ，<String>
   * */
  const newArr = []
  const keyArr = Object.keys(this.config.mapper)
  if(keyArr.includes("text") && keyArr.includes("value")){
    data.forEach((item) => {
      const newObj = {}
      for (const key in this.config.mapper) {
        Object.assign(newObj, { [key]: item[this.config.mapper[key]] })
      }
      newArr.push(newObj)
    })
  } else {
    data.forEach((item) => {
      const newObj = {}
      for (const key in this.config.mapper) {
        Object.assign(newObj, { [this.config.mapper[key]]: item[key] })
      }
      newArr.push(newObj)
    })
  }
  return newArr
}

/**
 * 查找实例，传递给 options
 * @description 解决 options 中无法获取 this 问题
 */
function findComponentUpward(context) {
  let parent = context.$parent
  let name = parent.$options.name
  const filterName = 'BrickFilter'
  const blendPageName = 'ZBlendPage'

  // 找到 BrickFilter 实例
  while (parent && (!name || name !== filterName)) {
    parent = parent.$parent
    if (parent) name = parent.$options.name
  }
  // 父级为 ZBlendPage 实例
  if (parent.$parent.$options.name === blendPageName) {
    parent = parent.$parent
  }
  // 返回父级实例
  parent = parent.$parent
  return parent
}

/**
 * @executor 回调执行函数
 * @next 下一步操作
 */
export function _WAIT_PROMISE_FULFILLED(executor, next) {
  /**
   *  约定外部传来的 executor 是一个函数
   *  executor 执行后返回一个promise
   * */
  if (this.remoteData.length !== 0) {
    /* 有值，直接去构造 options */
    return next(this.remoteData)
  } else if (this.singleFetchCount === 0) {
    /* 累加器 最大为 1 */
    this.singleFetchCount += 1
    Object.freeze(this.singleFetchCount)
    /* options 传递实例参数 */
    const vm = findComponentUpward(this)
    /* 无值，去fetch 远程 options */
    const promise = executor(vm)
    if(promise instanceof Promise){
      window.asyncQueue ? window.asyncQueue.push(promise) : (window.asyncQueue = [], window.asyncQueue.push(promise))
      promise.then(res => {
        this.remoteData = res
      })
    } else {
      this.remoteData = promise
    }
    
  }
  return next(this.remoteData)
}

/**
 * @ALL 所有的配置
 * @PRIVATE 内部定义的私有配置，禁止改动的配置
 * @PUBLIC  内部定义的私有配置，可进一步覆写的配置
 */
export function _PROPS_MERGE(ALL, PRIVATE, PUBLIC) {
  return {
    ...PUBLIC,
    ...ALL,
    ...PRIVATE
  }
}

/**
 * @allAttrs 所有要传递给fragment的props
 * @hasFragment 依赖fragment的组件所支持的props项
 * 解决element-plus 组件内部使用了 fragment 的组件并且直接 v-bind="$attrs" 所造成的属性透传警告
 */
 export function notTransmitPropsForFragment(allAttrs, fragmentAttrs) {
  let source = Object.keys(allAttrs)
  /* concat一组应当支持的props，但是props中未声明 */
  const target = Object.keys(fragmentAttrs).concat(["class","style"])
  const reg = /(-.)/g
  /* 处理自定义属性中的 - 转为 CamelCase Style*/
  source.map((item) => {
    if (item.indexOf("-")) {
      return item.replace(reg, (a, b) => {
        return String(b.substr(-1)).toUpperCase()
      })
    }
    return item
  })
  /* 过滤掉 fragmentAttrs 中不支持的props （数组取差集）*/
  source = source.filter(item => target.includes(item))

  /* 重新生成新的props */
  const finalAttrs = {}
  source.forEach(key => {
    finalAttrs[key] = allAttrs[key]
  })
  return finalAttrs
}