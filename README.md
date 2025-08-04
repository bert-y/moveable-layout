## moveable-layout
一款基于vue2和moveable实现的拖动排版插件，支持缩放、旋转、定位以及保存和根据保存数据自动初始化布局等能力。

## Install
    npm install moveable-layout -S
## 截图
    后续提供
## Usage
1. 在main.js中全局安装插件
 ```js  
import Vue from 'vue'  
import App from './App.vue'
import MoveableLayout  from "moveable-layout" 
import "moveable-layout/lib/moveable-layout.css" 
Vue.use(MoveableLayout);
```
2. 页面使用
```html
<moveable-layout ref="layout" 
                :seat-templates="seat" 
                :stage-size="stageSize" 
                :save-layout="save" 
                :deal-overlap="dealOverlap">
</moveable-layout>
<script>
export default {
    name: 'App',
    data() {
        return {
            // 图例部分数据
            seat:[
                { name: '普通座位', width: 100, height: 80, color: '#f0ad4e' },
                { name: 'VIP座位', width: 120, height: 100, color: '#428bca' },
                { name: '轮椅区', width: 150, height: 120, color: '#5cb85c' }
            ],
            // 舞台区域尺寸（后期可能删除）
            stageSize: {
                width: 600,
                height: 600
            }
        }
    },
    mounted() {
        this.init();
    },
    methods: {
        // 保存舞台数据之后的回调函数
        save(layout) {
            console.log("save layout res: ",layout);
        },
        // 初始化舞台数据
        init() {
            const para = [
                {
                    "id": 1,
                    "name": "普通座位",
                    "x": 239,
                    "y": 127,
                    "width": 100,
                    "height": 80,
                    "rotate": 0,
                    "color": "#f0ad4e",
                    "zIndex": 1
                }
            ]
            // 调用初始化函数
            this.$refs.layout.init(para);
        },
	    dealOverlap() {
		    alert("dealOverlap");
	    }
    }
}
</script>
```