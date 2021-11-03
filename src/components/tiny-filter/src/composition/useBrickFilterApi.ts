
import { ref } from "vue"
import {_deepClone} from "../util"

export const useBrickFilterApi = () => {



    return {
        getOptionsMap,
        setOptionsMap,
        setReactiveFilter,
        getReactiveFilter,
        getQueryParams,
        verify
    }
}

function getOptionsMap(key?:string){
    if(key){
        return _deepClone(this.$refs['filter'].OPTIONS[key] || this.$refs['filter'].OPTIONS)
    }
}
function setOptionsMap(){
    
}
function setReactiveFilter(){
    
}
function getReactiveFilter(){
    
}
function getQueryParams(){
    
}
function verify(){
    
}
