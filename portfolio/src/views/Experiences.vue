<template>
  <div class="total-experience-box container-fluid">
    <h3 class="info-title">EXPERIENCE</h3>
    <p class="fs-5">학력 및 경험사항</p>
    <div class="hr-1"></div>
    <div class="total-experience-content-box">
      <div class="pt-5">
        <div class="d-flex justify-content-center experience-content">
          <div class="text-end col">
            <h5 class="fw-bold">EDUCATION</h5>
            <div class="text-end mt-4">
              <p class="mb-1">2018 - 2020</p>
              <p class="fs-5 fw-bold my-0">운동생화학 석사</p>
              <p class="my-0">서울대학교 대학원, 대한민국</p>
            </div>
            <div class="text-end mt-5">
              <p class="mb-1">2014 - 2017</p>
              <p class="fs-5 fw-bold my-0">체육교육 학사</p>
              <p class="my-0">부산대학교 사범대학, 대한민국</p>
            </div>
          </div>
          <div class="v-line"></div>
          <div class="text-start col">
            <h5 class="fw-bold">EXPERIENCE</h5>
            <div class="text-start mt-4">
              <p class="mb-1">2022.12 - ing</p>
              <p class="fw-bold my-0">JKLMnoP (CS 및 FE 개발) 스터디</p>
              <!-- <p class="my-0"></p> -->
            </div>

            <div class="text-start mt-4">
              <p class="mb-1">2022.07 - 2023.01</p>
              <p class="fw-bold my-0">삼성 SCSA 19기</p>
              <!-- <p class="my-0"></p> -->
            </div>
            <div class="text-start mt-4">
              <p class="mb-1">2021.12 - ing</p>
              <p class="fw-bold my-0">JJMG 알고리즘 스터디</p>
              <!-- <p class="my-0"></p> -->
            </div>
            <div class="text-start mt-4">
              <p class="mb-1">2021.07 - 2022.05</p>
              <p class="fw-bold my-0">삼성청년SW아카데미 6기</p>
              <!-- <p class="my-0"></p> -->
            </div>

            <div class="text-start mt-4">
              <p class="mb-1">2017.01 - 2017.02</p>
              <p class="fw-bold my-0">영국 Sheffield 대학 교환학생</p>
              <!-- <p class="my-0">부산대학교 사범대학, 대한민국</p> -->
            </div>
          </div>
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
* {
  //   color: #fafafa;
  color: black;
}
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
.total-experience-box {
  //   max-width: 1200px;
  //   max-width: 1000px;
  //   background: #424242;
  margin: 5rem auto 1rem auto;

  //   width: 99vw;
}
.total-experience-content-box {
  max-width: 1000px;
  border-radius: 20px;
  margin: 0rem auto 0rem auto;
  background: radial-gradient(145% 145.46% at 0% 0%, #fff 0%, #eee 100%);
  box-shadow: 20px 20px 60px rgb(0 0 0 / 5%),
    -20px -20px 60px rgb(255 255 255 / 80%);
}
.info-title {
  width: 30%;
  margin: auto;
}
.experience-content-box {
  //   max-width: 1200px;
  max-width: 1000px;
  margin: 0 auto 0 auto;
}
.hr-1 {
  width: 15%;
  margin: 1rem auto 2rem auto;
  //   padding: 0rem auto 0rem auto;
  //   color: rgb(0, 0, 0, 0.4);
  border-bottom: 1px solid white;
}
.v-line {
  //   width: 50px;
  //   height: 80vh;
  margin: 0 1rem 0rem 1rem;
  border-left: 2px solid #d9d9d9;
}
.experience-content {
  padding: 0rem 0rem 3rem 0rem;
}
</style>
