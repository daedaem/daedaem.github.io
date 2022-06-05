<template>
  <div class="total-skills-box">
    <div class="skill-content-box">
      <h3 class="pt-5">SKILL</h3>
      <p class="fs-5">보유 기술 스택</p>
      <div class="hr-1"></div>
      <div class="skill-boxes">
        <div class="skill-box">
          <p class="fs-5 mb-0 fw-bold">HTML, CSS, Javascript</p>
          <img
            class="skill-logo-image"
            src="@/assets/htmlJsCss.png"
            style="width: 220px"
            alt=""
          />
          <div class="mt-4">
            <i class="bi bi-star-fill"></i>
            <i class="bi bi-star-fill"></i>
            <i class="bi bi-star-fill"></i>
            <i class="bi bi-star-fill"></i>
          </div>
          <p class="text-start px-4 pt-4" style="font-size: 0.9rem">
            계획된 와이어 프레임과 동일한 웹 구현
            <br />
            / 반응형 설계 가능
          </p>
        </div>
        <div class="skill-box">
          <p class="fs-5 mb-0 fw-bold">Vue.js</p>

          <img
            class="skill-logo-image"
            src="@/assets/VueLogo.png"
            style="width: 5rem"
            alt=""
          />
          <div class="mt-4">
            <i class="bi bi-star-fill"></i>
            <i class="bi bi-star-fill"></i>
            <i class="bi bi-star-fill"></i>
          </div>
          <p class="text-start px-4 pt-4" style="font-size: 0.9rem">
            vue 2.x 및 3.x 버젼 사용 가능 /
            <br />
            vuex 활용한 상태관리를 이해하고 활용 /
            <br />
            작은 규모의 웹서비스 구현 가능
          </p>
          <!-- <p>아아</p> -->
        </div>
        <div class="skill-box">
          <p class="fs-5 mb-0 fw-bold">Python</p>
          <img
            class="skill-logo-image"
            src="https://raw.githubusercontent.com/pkkulhari/pkkulhari/master/icons/python.svg"
            style="width: 5rem"
            alt=""
          />
          <div class="mt-4">
            <i class="bi bi-star-fill"></i>
            <i class="bi bi-star-fill"></i>
            <i class="bi bi-star-fill"></i>
          </div>
          <p class="text-start px-4 pt-4" style="font-size: 0.9rem">
            정렬, 시물레이션, 그래프 탐색 등 기본 알고리즘 구현
            <br />
            <!-- / 삼성 SW 역량테스트 IM 취득 -->
          </p>
          <!-- <p>아아</p> -->
        </div>
        <div class="skill-box">
          <p class="fs-5 mb-0 fw-bold">Git</p>

          <img
            class="skill-logo-image"
            src="https://camo.githubusercontent.com/fbfcb9e3dc648adc93bef37c718db16c52f617ad055a26de6dc3c21865c3321d/68747470733a2f2f7777772e766563746f726c6f676f2e7a6f6e652f6c6f676f732f6769742d73636d2f6769742d73636d2d69636f6e2e737667"
            style="width: 6rem"
            alt=""
          />
          <div class="mt-4">
            <i class="bi bi-star-fill"></i>
            <i class="bi bi-star-fill"></i>
            <i class="bi bi-star-fill"></i>
          </div>
          <p class="text-start px-4 pt-4" style="font-size: 0.9rem">
            Gitflow branch 전략을 활용한 협업 가능 <br />
            / Git convention 숙지하여 협업 가능
          </p>
        </div>
        <div class="skill-box">
          <p class="fs-5 mb-0 fw-bold">Django</p>

          <img
            class="skill-logo-image"
            src="@/assets/django.png"
            style="width: 6rem"
            alt=""
          />
          <div class="mt-4">
            <i class="bi bi-star-fill"></i>
            <i class="bi bi-star-fill"></i>
          </div>
          <p class="text-start px-4 pt-4" style="font-size: 0.9rem">
            CRUD 기능 구현 가능 / Django REST Framework를 활용한 API 설계 구현
          </p>
          <!-- <p>아아</p> -->
        </div>
        <div class="skill-box">
          <p class="fs-5 mb-0 fw-bold">React</p>

          <img
            class="skill-logo-image"
            src="@/assets/react.png"
            style="width: 100px"
            alt=""
          />
          <div class="mt-4">
            <i class="bi bi-star-fill"></i>
            <i class="bi bi-star-fill"></i>
          </div>
          <p class="text-start px-4 pt-4" style="font-size: 0.9rem">
            CRUD 기능 구현 가능 <br />
            / 현재 학습 진행 중
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "Experiences",
  setup() {
    return {};
  },
};
</script>
<style lang="scss" scoped>
.total-skills-box {
  //   height: 100vh;
  max-width: 1000px;
  //   background: #fafafa;
  margin: 0rem auto 5rem auto;
  //   width: 99vw;
}
.skill-content-box {
  //   max-width: 1200px;
  margin: 0 auto 0 auto;
}
.hr-1 {
  width: 10%;
  margin: 1rem auto 2rem auto;
  //   padding: 0rem auto 0rem auto;
  //   color: rgb(0, 0, 0, 0.4);
  border-bottom: 1px solid white;
}
.skill-boxes {
  max-width: 980px;
  min-height: 550px;
  margin: 0rem auto 0rem auto;
  display: grid;
  grid-gap: 2rem;

  grid-template-columns: repeat(3, 1fr);
}
.skill-box {
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  height: 100%;
  background: radial-gradient(145% 145.46% at 0% 0%, #fff 0%, #eee 100%);
  box-shadow: 20px 20px 60px rgb(0 0 0 / 5%),
    -20px -20px 60px rgb(255 255 255 / 80%);
  border-radius: 20px;
  //   margin: 0 auto 0 auto;
  padding: 2rem 0rem 1rem 0rem;
  //   max-width: 350px;
}
.skill-logo-image {
  margin: 1rem 0 0rem 0;
}
.bi-star-fill {
  color: #fe8a01;
  font-size: 0.8rem;
  margin: 0rem 0.25rem 1rem 0.25rem;
}
</style>
