<template>
  <nav class="footer container-fluid py-5 text-start">
    <div class="fw-bold">Haesung Cho's Portfolio</div>
    <div class="d-flex gap-3 mt-3">
      <a :href="links.instagram" target="_blank"
        ><i class="bi bi-instagram fs-5"></i
      ></a>
      <a :href="links.facebook" target="_blank">
        <i class="bi bi-facebook fs-5"></i
      ></a>
      <a :href="links.github" target="_blank"
        ><i class="bi bi-github fs-5"></i
      ></a>
      <a :href="links.linkedin" target="_blank"
        ><i class="bi bi-linkedin fs-5"></i
      ></a>
      <a href="mailto:tg8685@gmail.com"
        ><i class="bi bi-envelope-fill fs-5"></i
      ></a>
    </div>
  </nav>
</template>

<script>
import { reactive } from "vue";
export default {
  name: "Footer",
  setup() {
    const links = reactive({
      facebook: "https://www.facebook.com/tanggae",
      github: "https://github.com/daedaem",
      instagram: "https://www.instagram.com/sun_castle_8685/",
      linkedin:
        "https://www.linkedin.com/in/%ED%95%B4%EC%84%B1-%EC%A1%B0-518a021a9/",
    });
    return { links };
  },
};
</script>

<style lang="scss" scoped>
// * {
// }
.footer {
  background: transparent;
  height: 200px;
}
.container-fluid {
  max-width: 1000px;
}
a {
  color: rgb(69, 69, 69);
}
</style>
