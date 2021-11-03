<template>
  <div id="app">
    <Filter :schema="schema" :model="model"/>
  </div>
</template>
<script lang="ts">
  import { defineComponent,reactive,watch } from "vue"
  import { FormItemConfig } from "./components/tiny-filter/src/types"
  import Filter from "./components/tiny-filter/src/core/index.vue"
  export default defineComponent({
    name: "App",
    components: { Filter },
    setup() {
      let config = [
        // {
        //   key: "vendorId",
        //   label: "供应商ID",
        //   //default:"123456",
        //   disabled: true,
        //   attrs: {
        //     placeholder: "fafa111",
        //     maxlength: 5,
        //     readonly: "readonly"
        //   }
        // },
        {
          key: "vendorCode",
          label: "供应商编号",
          component: "input",
          default: 20200819
        },
        {
          key: "vendorPhoneNumber",
          label: "供应商手机号",
          component: "input",
          default: "13973140494"
        },
        {
          key: "vendorType",
          label: "供应商类型",
          component: "select",
          //multiple: false,
          options: [
            {
              text: "蔬菜供应商",
              value: 0
            },
            {
              text: "常规供应商",
              value: 1
            }
          ],
          rules: [{ required: true, message: "类型必选", trigger: "change" }]
        },
        // {
        //   key: ["signInTimeS", "signInTimeE"],
        //   label: "注册时间：",
        //   component: "picker",
        //   type: "time",
        //   isRange: true,
        //   rules: [{ required: true, message: "必选", trigger: "change" }]
        //   //default: "2020-07-08"
        // },
        // {
        //   key: "vendorXTimeStart",
        //   label: "供应商牛逼时间牛",
        //   component: "picker",
        //   type: "date",
        //   default: "2020-10-12",
        //   format: "yyyy年MM月dd日",
        //   "value-format": "yyyy-MM-dd",
        //   rules: [{ required: true, message: "类型必选", trigger: "change" }]
        // },
        // {
        //   key: "isOpen",
        //   label: "仅显示差异数据",
        //   component: "switch",
        //   default: "牛逼",
        //   allowableValue: ["牛逼", "不牛逼"]
        // },
        // {
        //   key: "vendorCitys",
        //   label: "供应商所在城市",
        //   component: "checkboxGroup",
        //   options: [
        //     {
        //       areaName: "长沙",
        //       areaId: "长沙"
        //     },
        //     {
        //       areaName: "浏阳的大帅比伍宇威",
        //       areaId: "浏阳"
        //     },
        //     {
        //       areaName: "张家界",
        //       areaId: "张家界"
        //     },
        //     {
        //       areaName: "常德",
        //       value: "常德"
        //     }
        //   ],
        //   isButton: true,
        //   col: 2,
        //   mapper: {
        //     text: "areaName",
        //     value: "areaId"
        //   }
        // }
      ]

      let schema: FormItemConfig = reactive([
        {
          key:"name",
          label:"姓名",
          component:"input"
        },
        {
          key:["startDate","endDate"],
          label:"业务时间",
          component:"picker",
          type:"daterange",
        },
        {
          key:"tDate",
          label:"单日期",
          component:"picker",
          type:"date"
        },
        {
          key: "vendorType",
          label: "静态下拉框",
          component: "select",
          //multiple: false,
          options: [
            {
              text: "蔬菜供应商",
              value: 0
            },
            {
              text: "常规供应商",
              value: 1
            }
          ],
          rules: [{ required: true, message: "类型必选", trigger: "change" }]
        },
        {
          key:"areaId",
          label:"地区",
          //disabled:
          component:"select",
          options({resolve}){
            setTimeout(() => {
              resolve([
                {
                  areaName:"湖南",
                  areaId:"101"
                }
              ])
            }, 2000);
          },
          mapper:{
            text:"areaName",
            value:"areaId"
          }
        },
        {
          key:"storeId",
          label:"联动-所属仓库",
          component:"select",
          options({resolve,model}){
            watch(() => model.areaId,async (newVal) => {
              //const res = await api.getData({parma:newVal})
              resolve([
                {
                  text:`${Math.random().toFixed(2)}中心仓`,
                  value:"1"
                }
              ],"update")
            })
          }
        },
        {
          key:"auditStatus",
          label:"审核状态",
          component:"radioGroup",
          isButton:true,
          col:2,
          options:[
            {
              text:"待审核",
              value:"1",
            },
            {
              text:"已审核",
              value:"2",
            },
            {
              text:"待复审核",
              value:"3",
            },
            {
              text:"已驳回",
              value:"4",
            },
          ]
        }
      ])
      let model = {
        name:"12",
        startDate:"",
        endDate:"",
        tDate:"",
        areaId:"",
        storeId:"",
        vendorType:"",
        auditStatus:""
      }
      window.schema = schema
      return {
        //config,
        schema,
        model
      }
    }
  })
</script>
