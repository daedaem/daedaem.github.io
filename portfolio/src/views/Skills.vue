<template>
  <div class="total-skills-box">
    <div class="skill-content-box">
      <h3 class="pt-5">SKILL</h3>
      <h5>보유 기술 스택</h5>
      <div class="hr-1"></div>
      <div class="skill-boxes">
        <div class="skill-box">
          <h5 class="mb-0 fw-bold">HTML, CSS</h5>
          <img
            class="skill-logo-image"
            src="@/assets/htmlcss.png"
            style="width: 12rem"
            alt=""
          />
          <div class="mt-4"></div>
          <p class="text-start px-4 pt-4">
            Flex 및 Grid layout 이해
            <br />
            / 반응형 설계 가능
          </p>
        </div>
        <div class="skill-box">
          <h5 class="mb-0 fw-bold">JavaScript</h5>
          <img
            class="skill-logo-image"
            src="@/assets/javascript.png"
            style="width: 6rem"
            alt=""
          />
          <div class="mt-4"></div>
          <p class="text-start px-4 pt-4">
            기본적인 문법 이해 및 기능 구현가능 <br />
            특정 이슈 트러블 슈팅 가능
          </p>
        </div>
        <div class="skill-box">
          <h5 class="mb-0 fw-bold">Vue.js</h5>
          <img
            class="skill-logo-image"
            src="@/assets/VueLogo.png"
            style="width: 6rem"
            alt=""
          />
          <div class="mt-4"></div>
          <p class="text-start px-4 pt-4">
            Composition API 활용한 코드 재사용 및 논리적 구분 /
            <br />
            vuex 활용한 상태관리 이해 및 활용 /
            <br />
          </p>
          <!-- <p>아아</p> -->
        </div>

        <div class="skill-box">
          <h5 class="mb-0 fw-bold">React</h5>

          <img
            class="skill-logo-image"
            src="@/assets/react.png"
            style="width: 100px"
            alt=""
          />
          <div class="mt-4"></div>
          <p class="text-start px-4 pt-4">CRUD 기능 구현 가능 <br /></p>
        </div>
        <div class="skill-box">
          <h5 class="mb-0 fw-bold">TypeScript</h5>
          <img
            class="skill-logo-image"
            src="@/assets/typescript.png"
            style="width: 6rem"
            alt=""
          />
          <div class="mt-4"></div>
          <p class="text-start px-4 pt-4">
            타입스크립트의 기본 문법을 이해하고 코드를 읽을 수 있음<br />
            <br />
          </p>
        </div>
        <div class="skill-box">
          <h5 class="mb-0 fw-bold">ETC</h5>
          Python / C++
          <div>
            <img
              class="skill-logo-image mx-1"
              src="https://raw.githubusercontent.com/pkkulhari/pkkulhari/master/icons/python.svg"
              style="width: 4rem"
              alt=""
            />
            <img
              class="skill-logo-image mx-1"
              src="https://upload.wikimedia.org/wikipedia/commons/1/18/ISO_C%2B%2B_Logo.svg"
              style="width: 4rem"
              alt=""
            />
          </div>
          <div class="mt-4"></div>
          <p class="text-start px-4 pt-4">
            기본 자료구조 구현
            <br />
            응용 알고리즘 구현 가능
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
  font-size: 2.5rem;
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
p {
  font-size: 0.9rem;
}
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
  justify-content: flex-start;
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
.bi-star {
  color: #fe8a01;
  font-size: 0.8rem;
  margin: 0rem 0.25rem 1rem 0.25rem;
}
@media screen and (max-width: 768px) {
  h1 {
    font-size: 3rem;
    font-weight: bold;
    font-family: "SF Pro Display", -apple-system, system-ui, BlinkMacSystemFont,
      "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  }
  h2 {
    font-size: 2.5rem;
  }
  h3 {
    font-size: 2rem;
    font-weight: bold;
    font-family: "SF Pro Display", -apple-system, system-ui, BlinkMacSystemFont,
      "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  }
  h4 {
    font-size: 1.5rem;
  }
  h5 {
    font-size: 1rem;
  }
  p {
    font-size: 0.7rem;
  }
  .skill-boxes {
    max-width: 980px;
    min-height: 550px;
    margin: 0rem auto 0rem auto;
    display: grid;
    grid-gap: 1.5rem;
    grid-template-columns: repeat(2, 1fr);
  }
  .skill-box {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    height: 100%;
    background: radial-gradient(145% 145.46% at 0% 0%, #fff 0%, #eee 100%);
    box-shadow: 20px 20px 60px rgb(0 0 0 / 5%),
      -20px -20px 60px rgb(255 255 255 / 80%);
    border-radius: 20px;
    margin: 0 1rem 0 1rem;
    padding: 2rem 0rem 1rem 0rem;
    //   max-width: 350px;
  }
}
@media screen and (max-width: 576px) {
  h1 {
    font-size: 3rem;
    font-weight: bold;
    font-family: "SF Pro Display", -apple-system, system-ui, BlinkMacSystemFont,
      "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  }
  h2 {
    font-size: 2.5rem;
  }
  h3 {
    font-size: 2rem;
    font-weight: bold;
    font-family: "SF Pro Display", -apple-system, system-ui, BlinkMacSystemFont,
      "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  }
  h4 {
    font-size: 1.5rem;
  }
  h5 {
    font-size: 1rem;
  }
  p {
    font-size: 0.7rem;
  }
  .skill-boxes {
    max-width: 980px;
    min-height: 550px;
    margin: 0rem auto 0rem auto;
    display: grid;
    grid-gap: 2rem;
    grid-template-columns: repeat(1, 1fr);
  }
  .skill-box {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    height: 100%;
    background: radial-gradient(145% 145.46% at 0% 0%, #fff 0%, #eee 100%);
    box-shadow: 20px 20px 60px rgb(0 0 0 / 5%),
      -20px -20px 60px rgb(255 255 255 / 80%);
    border-radius: 20px;
    margin: 0 2rem 0 2rem;
    padding: 2rem 0rem 1rem 0rem;
    //   max-width: 350px;
  }
}
</style>
