<template>
  <div class="container">
    <div class="controls">
      <button @click="save">保存布局</button>
    </div>
    <!-- 座位模板区 -->
    <div class="seat-templates">
      <div
          v-for="(template, index) in seatTemplates"
          :key="'template-'+index"
          class="seat-template"
          :style="{ backgroundColor: template.color }"
          draggable="true"
          @dragstart="onTemplateDragStart($event, template)"
      >
        {{ template.name }}
      </div>
    </div>
    <!-- 主舞台区 -->
    <div
        class="stage"
        ref="stage"
        :style="stageStyle"
        @dragover.prevent
        @drop="onStageDrop"
    >
      <div class="grid" v-if="showGrid" :style="gridStyle"></div>
      <!-- 已放置的座位 -->
      <div
          v-for="(seat, index) in seats"
          :key="seat.id"
          class="seat"
          :data-id="seat.id"
          :style="{
          transform: `translate(${seat.x}px, ${seat.y}px) rotate(${seat.rotate}deg)`,
          width: `${seat.width}px`,
          height: `${seat.height}px`,
          backgroundColor: seat.color,
          zIndex: seat.zIndex
        }"
          @click.stop="selectSeat(index)"
          ref="seatElements"
      >
        <div class="seat-label">{{ seat.name }}</div>
      </div>

      <!-- Moveable 控制器 -->
      <Moveable
          v-if="selectedSeatIndex !== null"
          ref="moveable"
          :target="targetElements"
          :draggable="true"
          :resizable="true"
          :rotatable="true"
          :snappable="true"
          :snapGap="snapGap"
          :snapContainer="snapContainer"
          :snapDirections="snapDirections"
          :elementSnapDirections="elementSnapDirections"
          :elementGuidelinesAll="false"
          :elementGuidelines="elementGuidelines"
          :snapThreshold="5"
          :bounds="{ left: 0, top: 0, right: stageSize.width, bottom: stageSize.height }"
          :edge="false"
          :origin="false"
          :keepRatio="false"
          @drag="handleDrag"
          @resize="handleResize"
          @rotate="handleRotate"
          @dragEnd="handleDragEnd"
          @resizeEnd="handleResizeEnd"
          @rotateEnd="handleRotateEnd"
      />
    </div>
  </div>
</template>

<script>
import Moveable from 'vue-moveable';

export default {
  name: "moveable-layout",
  components: {
    Moveable
  },
  props: {
    seatTemplates: {
      type: Array,
      default: () => [
        { name: '普通座位', width: 100, height: 80, color: '#f0ad4e' }
      ]
    },
    stageSize: {
      type: Object,
      default: () => {
        return {
          width: 100,
          height: 200
        }
      },
      required: true
    },
    saveLayout: {
      type: Function,
      required: true
    },
    preventOverlap: {
      type: Boolean,
      default: true,
      required: false
    },
    dealOverlap: {
      type: Function,
      required: false
    }
  },
  data() {
    return {
      seats: [],
      nextId: 1,
      selectedSeatIndex: null,
      elementGuidelinesEnabled: true,
      snapEnabled: true,
      gridSize: 30,
      showGrid: true,
      snapGap: true,
      snapDirections : {"top":true,"left":true,"bottom":true,"right":true,"center":true,"middle":true},
      elementSnapDirections : {"top":true,"left":true,"bottom":true,"right":true,"center":true,"middle":true},
      draggedTemplate: null
    };
  },
  computed: {
    snapContainer() {
      return this.$refs.stage;
    },
    targetElements() {
      if (this.selectedSeatIndex === null) return [];
      const element = this.$refs.seatElements[this.selectedSeatIndex];
      return element ? [element] : [];
    },
    elementGuidelines() {
      if (!this.elementGuidelinesEnabled) return [];
      return this.$refs.seatElements.filter((_, i) => i !== this.selectedSeatIndex) || [];
    },
    gridStyle() {
      return {
        backgroundSize: `${this.gridSize}px ${this.gridSize}px`,
        backgroundImage: `
          linear-gradient(to right, #eee 1px, transparent 1px),
          linear-gradient(to bottom, #eee 1px, transparent 1px)
        `
      };
    },
    stageStyle() {
      return {
        width: `${this.stageSize.width}px`,
        height: `${this.stageSize.height}px`,
      }
    }
  },
  methods: {
    // 从模板开始拖拽
    onTemplateDragStart(event, template) {
      this.draggedTemplate = template;
      event.dataTransfer.setData('text/plain', '');
    },

    // 在舞台放置座位
    onStageDrop(event) {
      event.preventDefault();
      if (!this.draggedTemplate) return;

      const stageRect = this.$refs.stage.getBoundingClientRect();
      const x = event.clientX - stageRect.left - (this.draggedTemplate.width / 2);
      const y = event.clientY - stageRect.top - (this.draggedTemplate.height / 2);

      this.seats.push({
        id: this.nextId++,
        name: this.draggedTemplate.name,
        x: this.snapEnabled ? Math.round(x / this.gridSize) * this.gridSize : x,
        y: this.snapEnabled ? Math.round(y / this.gridSize) * this.gridSize : y,
        width: this.draggedTemplate.width,
        height: this.draggedTemplate.height,
        rotate: 0,
        color: this.draggedTemplate.color,
        zIndex: 1
      });
      this.draggedTemplate = null;
      const current = this.seats[this.seats.length - 1];
      const overlap  = this.seats.some((seat, index) => {
        if (index === this.seats.length - 1) return false;
        return this.checkRotatedRectOverlap(current, seat);
      })
      if(this.preventOverlap && overlap) {
        this.dealOverlap();
        this.seats.pop();
      }
    },

    init(seats) {
      this.nextId = seats.reduce((p,v) => p.id < v.id ? v : p).id + 1;
      this.seats = seats;
    },

    resetLocation(seat, last_x, last_y, last_w = null, last_h = null, last_rotate = null) {
      if(last_x !== null) seat.x = last_x;
      if(last_y !== null) seat.y = last_y;
      if(last_w !== null) seat.width = last_w;
      if(last_h !== null) seat.height = last_h;
      if(last_rotate !== null) seat.rotate = last_rotate;
      this.$nextTick(() => {
        if (this.$refs.moveable) {
          this.$refs.moveable.updateRect();
        }
      });
    },

    // 检查两个旋转后的矩形是否交叉
    checkRotatedRectOverlap(rect1, rect2) {
      // 简化的碰撞检测（精确的旋转矩形碰撞检测较复杂，这里使用外接矩形简化）
      const getBoundingRect = (rect) => {
        const rad = rect.rotate * Math.PI / 180;
        const cos = Math.abs(Math.cos(rad));
        const sin = Math.abs(Math.sin(rad));
        const width = rect.width * cos + rect.height * sin;
        const height = rect.width * sin + rect.height * cos;
        return {
          x: rect.x - (width - rect.width) / 2,
          y: rect.y - (height - rect.height) / 2,
          width,
          height
        };
      };

      const r1 = getBoundingRect(rect1);
      const r2 = getBoundingRect(rect2);

      return !(
          r1.x + r1.width <= r2.x ||
          r1.x >= r2.x + r2.width ||
          r1.y + r1.height <= r2.y ||
          r1.y >= r2.y + r2.height
      );
    },

    // 检查当前元素是否与其他元素交叉
    checkCurrentOverlap() {
      if (this.selectedSeatIndex === null || !this.preventOverlap) return false;

      const current = this.seats[this.selectedSeatIndex];

      return this.seats.some((seat, index) => {
        if (index === this.selectedSeatIndex) return false;
        return this.checkRotatedRectOverlap(current, seat);
      });
    },

    // 选中座位
    selectSeat(index) {
      console.log(index);
      this.selectedSeatIndex = index;
      this.$nextTick(() => {
        if (this.$refs.moveable) {
          this.$refs.moveable.updateRect();
        }
      });
    },

    // 处理拖拽
    handleDrag(e) {
      e.target.style.transform = e.transform;
    },

    // 处理缩放 - 完全修正版
    handleResize(e) {
      // console.log(e);
      e.target.style.width = `${e.width}px`;
      e.target.style.height = `${e.height}px`;
      e.target.style.transform = e.drag.transform;
    },

    // 处理旋转
    handleRotate(e) {
      e.target.style.transform = e.drag.transform;
    },

    // 确保座位不会超出舞台边界
    clampSeatPosition(seat) {
      const stageRect = this.$refs.stage.getBoundingClientRect();
      seat.x = Math.max(0, Math.min(stageRect.width - seat.width, seat.x));
      seat.y = Math.max(0, Math.min(stageRect.height - seat.height, seat.y));
    },

    handleDragEnd(e) {
      // console.log(e,e.lastEvent.translate);
      const seat = this.seats[this.selectedSeatIndex];
      const last_x = seat.x;
      const last_y = seat.y;
      seat.x = e.lastEvent.translate[0];
      seat.y = e.lastEvent.translate[1];
      if(this.preventOverlap && this.checkCurrentOverlap()) {
        this.dealOverlap();
        this.resetLocation(seat, last_x, last_y);
      }
    },

    handleResizeEnd(e) {
      // console.log('缩放结束',e);
      const seat = this.seats[this.selectedSeatIndex];
      const last_x = seat.x;
      const last_y = seat.y;
      const last_w = seat.width;
      const last_h = seat.height;
      seat.x = e.lastEvent.drag.beforeTranslate[0];
      seat.y = e.lastEvent.drag.beforeTranslate[1];
      seat.width = e.lastEvent.width;
      seat.height = e.lastEvent.height;
      if(this.preventOverlap && this.checkCurrentOverlap()) {
        this.dealOverlap();
        this.resetLocation(seat, last_x, last_y, last_w, last_h);
      }
    },

    handleRotateEnd(e) {
      // console.log('旋转结束', e);
      const seat = this.seats[this.selectedSeatIndex];
      const last_rotate = seat.rotate;
      seat.rotate = e.lastEvent.beforeRotate;
      if(this.preventOverlap && this.checkCurrentOverlap()) {
        this.dealOverlap();
        console.log(last_rotate)
        this.resetLocation(seat, null, null, null, null, last_rotate);
      }
    },

    save() {
      console.log('当前布局:', JSON.stringify(this.seats, null, 2));
      // alert('布局已保存到控制台');
      const res = JSON.stringify(this.seats);
      this.saveLayout(res);
    }
  }
};
</script>

<style>
.container {
  font-family: Arial, sans-serif;
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.controls {
  margin: 20px 0;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 5px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.controls button {
  padding: 5px 10px;
  background: #428bca;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.controls button:hover {
  background: #3276b1;
}

.controls label {
  display: flex;
  align-items: center;
  gap: 5px;
}

/* 座位模板区 */
.seat-templates {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background: #f0f0f0;
  border-radius: 5px;
}

.seat-template {
  width: 100px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  cursor: grab;
  user-select: none;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 1px rgba(0,0,0,0.5);
}

.seat-template:active {
  cursor: grabbing;
}

/* 舞台区 */
.stage {
  position: relative;
  border: 2px dashed #ccc;
  margin-top: 10px;
  overflow: hidden;
  background-color: #fff;
}

.grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

/* 已放置的座位 */
.seat {
  position: absolute;
  border-radius: 5px;
  cursor: move;
  user-select: none;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  touch-action: none;
  display: flex;
  flex-direction: column;
  transform-origin: 50% 50%;
}

.seat-label {
  padding: 5px;
  text-align: center;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 1px rgba(0,0,0,0.5);
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Moveable 控制手柄样式 */
.moveable-control.moveable-direction {
  width: 12px;
  height: 12px;
  margin: -6px 0 0 -6px;
  background: #428bca;
  border: 2px solid white;
  box-sizing: border-box;
}

.moveable-control.moveable-rotation {
  width: 16px;
  height: 16px;
  margin: -8px 0 0 -8px;
  background: #d9534f;
  border: 2px solid white;
}

.moveable-line {
  background-color: #428bca;
}

.moveable-control-box {
  box-sizing: content-box;
  border: 2px dashed #428bca;
  z-index: 1000;
}

</style>
