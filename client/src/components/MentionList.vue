<template>
  <div class="items">
    <template v-if="items.length">
      <button
        class="item"
        :class="{ 'is-selected': index === selectedIndex }"
        v-for="(item, index) in items"
        :key="index"
        @click="selectItem(index)"
      >
        {{ item.userName }}
      </button>
    </template>
    <div class="item" v-else>
      No result
    </div>
  </div>
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
      required: true
    },

    command: {
      type: Function,
      required: true
    }
  },

  data () {
    return {
      selectedIndex: 0
    }
  },

  watch: {
    items () {
      this.selectedIndex = 0
    }
  },

  methods: {
    onKeyDown ({ event }) {
      if (event.key === 'ArrowUp') {
        this.upHandler()
        return true
      }

      if (event.key === 'ArrowDown') {
        this.downHandler()
        return true
      }

      if (event.key === 'Enter') {
        this.enterHandler()
        return true
      }

      return false
    },

    upHandler () {
      this.selectedIndex = ((this.selectedIndex + this.items.length) - 1) % this.items.length
    },

    downHandler () {
      this.selectedIndex = (this.selectedIndex + 1) % this.items.length
    },

    enterHandler () {
      this.selectItem(this.selectedIndex)
    },

    selectItem (index) {
      const item = this.items[index]

      if (item) {
        this.command({ id: item._id, label: item.userName })
      }
    }
  }
}
</script>

<style lang="scss">
.items {
  padding: 0.2rem;
  position: relative;
  background: #FFF;
  color: rgba(0, 0, 0, 0.8);
  font-size: 0.9rem;
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.05),
    0px 10px 20px rgba(0, 0, 0, 0.1),
  ;
  max-height: 300px;
  overflow: scroll;
}

.item {
  display: block;
  margin: 0;
  width: 100%;
  text-align: left;
  background: transparent;
  border-radius: 0.1rem;
  border: 1px solid transparent;
  padding: 0.2rem 0.4rem;

  &.is-selected {
    border-color: #000;
    background: #efefef;
  }
}
</style>
