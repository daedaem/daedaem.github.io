<template>
  <nav class="navbar navbar-expand-lg">
    <div class="container-fluid">
      <a class="navbar-brand name" href="/">ㅈㅎㅅ</a>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
        <ul class="navbar-nav">
          <li class="nav-item">
            <a class="nav-link" href="/about">About Me</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">Skill</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" herf="#">Portfolio</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">Experience</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: "Header",
  setup() {
    return {};
  },
};
</script>

<style lang="scss" scoped>
.navbar {
  background: transparent;
  & .name {
    font-family: "SF Pro Display", -apple-system, system-ui, BlinkMacSystemFont,
      "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    font-size: 3rem;
    // color: black;
  }
}
.container-fluid {
  max-width: 1000px;
}
</style>
