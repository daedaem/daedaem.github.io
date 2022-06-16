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
            SSAFY(삼성청년소프트웨어아카데미)에서의 체육 다양한 프로젝트 경험을
            통해 이 믿음에 대한 확신을 갖게 되어 개발자의 길을 걷고 있습니다.
          </p>
          <!-- <p>결국 해내는 집념을 갖고 있는 프론트엔드 개발자 조해성입니다.</p> -->
        </div>
        <!-- <p>
        I believe developers are people who can solve the problems that humans
        are experiencing.
      </p> -->
      </div>
      <div class="col d-flex justify-content-center"></div>
    </div>
    <Introduce></Introduce>
    <div class="my-5">
      <swiper
        class="swiper"
        :modules="modules"
        navigation
        :pagination="{ clickable: true }"
        :scrollbar="{ draggable: true }"
        :slides-per-view="2"
        :space-between="10"
        @swiper="onSwiper"
        @slideChange="onSlideChange"
      >
        <swiper-slide>
          <img class="swiper-image" src="@/assets/profile/ssafyEnd1.png" alt=""
        /></swiper-slide>
        <swiper-slide>
          <img class="swiper-image" src="@/assets/profile/sleeping.jpg" alt=""
        /></swiper-slide>
        <swiper-slide>
          <img
            class="swiper-image"
            src="@/assets/profile/masterDegree.jpg"
            alt=""
        /></swiper-slide>
        <swiper-slide>
          <img
            class="swiper-image"
            src="@/assets/profile/motorcycleAndMe.jpg"
            alt=""
        /></swiper-slide>
      </swiper>
    </div>
    <ETC></ETC>
  </div>
</template>
<script>
import { reactive } from "vue";
import ETC from "./ETC.vue";
import Introduce from "./Introduce.vue";
// Import Swiper Vue.js components
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Pagination, Scrollbar, A11y } from "swiper";

// Import Swiper styles
import "swiper/css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

export default {
  name: "About",
  components: { ETC, Introduce, Swiper, SwiperSlide },
  setup() {
    const links = reactive({
      facebook: "https://www.facebook.com/tanggae",
      github: "https://github.com/daedaem",
      instagram: "https://www.instagram.com/sun_castle_8685/",
      linkedin:
        "https://www.linkedin.com/in/%ED%95%B4%EC%84%B1-%EC%A1%B0-518a021a9/",
    });
    const onSwiper = (swiper) => {
      console.log(swiper);
    };
    const onSlideChange = () => {
      console.log("slide change");
    };
    return {
      links,
      onSwiper,
      onSlideChange,
      modules: [Navigation, Pagination, Scrollbar, A11y],
    };
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
  // height: 500px;

  // width: 400px;
}
.swiper {
  max-width: 1000px;
}
.swiper-image {
  object-fit: cover;
  width: 100%;
  height: 500px;
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
.swiper-button-next {
  color: rgba(255, 255, 255, 0.4);
  &:hover {
    color: white;
  }
}
.swiper-button-prev {
  color: rgba(255, 255, 255, 0.4);

  &:hover {
    color: white;
  }
}
.swiper-pagination-bullet.swiper-pagination-bullet-active {
  background: white;
}
</style>
