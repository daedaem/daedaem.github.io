<template>
  <div class="total-frame">
    <div class="total-info-box">
      <div class="image-box">
        <!-- <img class="profile-image" src="@/assets/profile/profileImage.jpg" alt="" /> -->
        <!-- <img class="profile-image" src="@/assets/profile/motorcycleAndMe.jpg" alt="" /> -->
        <img
          class="profile-image"
          src="@/assets/profile/profileImage.jpg"
          alt=""
        />
      </div>
      <div class="info-box col-6">
        <!-- <h1 class="mb-4">Haesung Cho</h1> -->
        <!-- <h5 class="mb-2">Frontend Developer.</h5> -->
        <div class="introduction-content">
          <p class="fs-5 my-0">
            <strong>
              '프로그래밍은 인류가 직면한 문제를 해결 할 수 있다고
              믿습니다.'</strong
            >
          </p>
          <br />
          <p>
            석사과정 중 IBM의 의료용 AI 플랫폼 '왓슨' 을 통한 70% 연구시간 감축
            경험은 프로그래밍 힘을 깨닫게 된 계기가 되었습니다.
          </p>
          <p>
            SSAFY(삼성청년소프트웨어아카데미)에서의 3번의 프로젝트 경험을 통해
            이 믿음에 대한 확신을 갖게 되어 개발자의 길을 걷고 있습니다.
          </p>
          <!-- <p>결국 해내는 집념을 갖고 있는 프론트엔드 개발자 조해성입니다.</p> -->
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
      <div class="col d-flex justify-content-center"></div>
    </div>
    <Introduce></Introduce>
    <ETC></ETC>
  </div>
</template>
<script>
import { reactive } from "vue";
import ETC from "./ETC.vue";
import Introduce from "./Introduce.vue";
export default {
  name: "About",
  components: { ETC, Introduce },
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
  height: 94vh;
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
.accordion {
  max-width: 1000px;
  margin: auto;
}
</style>
