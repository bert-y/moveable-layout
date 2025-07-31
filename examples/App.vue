<template>
  <div id="app">
    <MoveableLayout :seat-templates="seat"></MoveableLayout>
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
      ]
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
</style>
