<template>
  <div class="total-frame">
    <div class="total-info-box">
      <div class="info-box col-6">
        <h1 class="mb-4">Haesung Cho</h1>
        <h5 class="mb-2">Frontend Developer.</h5>
        <div class="introduction-content mt-1">
          <!-- <strong> UX 개선</strong>과 <strong> 협업에 적극</strong>적인 -->
          <!-- <strong> 프론트엔드 </strong> 개발자 조해성입니다. -->
          <!-- <strong> 끝까지 해내는 집념을 가진 프론트엔드 </strong> 개발자
          조해성입니다. -->
          <!-- <strong>  인류발전에 프론트엔드 </strong> 개발자 -->
          <!-- 조해성입니다. -->
          <!-- <br />
          <p style="font-size: 0.9rem">
            개발자는 인류가 직면한 문제를 해결 할 수 있다고 믿습니다.
          </p> -->
        </div>
        <!-- <p>
        I believe developers are people who can solve the problems that humans
        are experiencing.
      </p> -->
        <div class="subinfo-box">
          <div>
            <p><strong> E-mail</strong> : tg8685@gmail.com</p>
          </div>
          <div>
            <p><strong> Phone</strong> : +82 10-4449-8685</p>
          </div>
          <div>
            <p><strong> City</strong> : 부산, 대한민국</p>
          </div>
        </div>
        <div
          class="d-flex justify-content-start align-items-center link-images"
        >
          <a :href="links.facebook" target="_blank">
            <img
              class="link-image"
              src="@/assets/facebook-square-brands.svg"
              alt=""
          /></a>
          <a :href="links.github" target="_blank"
            ><img
              class="link-image"
              src="@/assets/github-square-brands.svg"
              alt=""
          /></a>
          <a :href="links.instagram" target="_blank"
            ><img
              class="link-image"
              src="@/assets/instagram-square-brands.svg"
              alt=""
          /></a>
          <a :href="links.linkedin" target="_blank"
            ><img class="link-image" src="@/assets/linkedin-brands.svg" alt=""
          /></a>
        </div>
      </div>
      <div class="col d-flex justify-content-center">
        <div class="image-box">
          <img class="profile-image" src="@/assets/profile/imoji1.png" alt="" />
          <!-- <img class="profile-image" src="@/assets/profile/motorcycleAndMe.jpg" alt="" /> -->
          <!-- <img class="profile-image" src="@/assets/profile/profileImage.jpg" alt="" /> -->
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { reactive } from "vue";
export default {
  name: "FirstInfo",
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
<style lang="scss">
h1 {
  font-size: 4rem;
  font-weight: bold;
  font-family: "SF Pro Display", -apple-system, system-ui, BlinkMacSystemFont,
    "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}
h2 {
  font-size: 3.5rem;
}
h3 {
  font-size: 3rem;
  font-weight: bold;
  font-family: "SF Pro Display", -apple-system, system-ui, BlinkMacSystemFont,
    "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}
h4 {
  font-size: 2rem;
}
h5 {
  font-size: 1.5rem;
}
a {
  color: black;
  // font-size: 1rem;
  text-decoration: none;
}

.total-info-box {
  max-width: 1000px;
  height: 90vh;
  margin: 0rem auto 0rem auto;
  display: flex;
  align-items: center;
}
.info-box {
  text-align: start;
  padding: 0rem 0rem 0rem 3rem;
  // background: #fafafa;
}
.introduction-content {
  text-align: start;
  // align-items: center;
  // padding: 1rem 4rem 1rem 1rem;
}
.subinfo-box {
  margin: 2rem 0rem 0rem 0rem;
}

.image-box {
  // background: whitesmoke;
  // align-items: center;
  width: 350px;
  height: 350px;

  border-radius: 100%;
  overflow: hidden;
  // width: 400px;
}
.profile-image {
  object-fit: cover;
  width: 100%;
  height: 100%;

  // width: 400px;
}
.link-images {
  gap: 1rem;
}
.link-image {
  width: 2rem;
}
</style>
