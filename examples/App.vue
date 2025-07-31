<template>
  <div id="app">
    <div class="layout_content">
      <MoveableLayout ref="layout" :seat-templates="seat" :stage-size="stageSize" :save-layout="save"></MoveableLayout>
    </div>
  </div>
</template>

<script>
import MoveableLayout  from "../packages/moveable-layout/index.vue";

export default {
  name: 'App',
  components: {
    MoveableLayout
  },
  data() {
    return {
      seat:[
          { name: '普通座位', width: 100, height: 80, color: '#f0ad4e' },
          { name: 'VIP座位', width: 120, height: 100, color: '#428bca' },
          { name: '轮椅区', width: 150, height: 120, color: '#5cb85c' }
      ],
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
    save(layout) {
      console.log("save layout res: ",layout);
    },
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
        },
        {
          "id": 2,
          "name": "VIP座位",
          "x": 240,
          "y": 210,
          "width": 120,
          "height": 100,
          "rotate": 0,
          "color": "#428bca",
          "zIndex": 1
        },
        {
          "id": 3,
          "name": "轮椅区",
          "x": 240,
          "y": 315,
          "width": 150,
          "height": 120,
          "rotate": 0,
          "color": "#5cb85c",
          "zIndex": 1
        }
      ]
      this.$refs.layout.init(para);
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.layout_content{
  width: 100%;
  height: 100%;
}
</style>
