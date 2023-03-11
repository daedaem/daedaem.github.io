<template>
  <Header class="header"></Header>

  <router-view />
  <Footer></Footer>
</template>
<script>
import Header from "./components/common/Header.vue";
import Footer from "./components/common/Footer.vue";

export default {
  name: "App",
  setup() {
    return {};
  },
  components: { Header, Footer },
};
</script>
<style lang="scss">
* {
  // font-family: "SF Pro Display", -apple-system, system-ui, BlinkMacSystemFont,
  //   "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  background: linear-gradient(160deg, #fff 0%, #ddd 40%, #ddd 100%);
  // color: #2c3e50;
}
#app ::-webkit-scrollbar {
  width: 6px;
}
#app ::-webkit-scrollbar-thumb {
  border-radius: 5px;
  -webkit-box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.3);
  background-color: #555;
  // overflow-y: auto;
  // overflow-x: hidden;
}

.header {
  top: 0;
}

nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;
  }
}
</style>
