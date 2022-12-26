<template>
  <div class="campus-total-info-box">
    <div class="info-box">
      <h1 class="my-5">Campus</h1>
      <div class="portfolio-detail-info-box">
        <h5>Info</h5>
        <div class="portfolio-detail-info-titles col-1">
          <div class="portfolio-detail-info-title">개발 기간</div>
          <div class="portfolio-detail-info-title">개발 인원</div>
          <div class="portfolio-detail-info-title">서비스</div>
          <div class="portfolio-detail-info-title">담당 기술</div>
          <br />
          <div class="portfolio-detail-info-title">관련 링크</div>
          <br />
          <div class="portfolio-detail-info-title">담당 업무</div>
        </div>
        <div class="portfolio-detail-info-contents col">
          <div class="portfolio-detail-info-content">
            2022.01.04 ~ 2022.02.18
          </div>
          <div class="portfolio-detail-info-content">
            총 5명 (백엔드 3명, 프론트엔드 2명)
          </div>
          <div class="portfolio-detail-info-content">
            전국 캠핑시설 조회 및 캠핑 메이트 중개 플랫폼
          </div>
          <div class="portfolio-detail-info-content">
            Javascript, Vue 2, bootstrap
          </div>
          <div class="portfolio-detail-info-content">
            <a href="https://github.com/daedaem/Campus" target="_blank">
              <button type="button" class="btn btn-dark my-3">
                저장소로 이동 <i class="bi bi-arrow-right-short"></i>
              </button>
            </a>
          </div>
          <div class="portfolio-detail-info-content">
            <strong>1. 팀장 (프로젝트 관리)</strong> <br />
            - Jira를 활용한 업무 계획 및 프로세스 진행 관리
            <br />
            - Notion을 활용한 데일리 스크럼, 아이디어 회의, 기획안 등 프로젝트
            관련업무 기록
            <br />

            <br />
            <strong> 2. 프론트엔드 </strong>
            <br />
            - 캠핑 생활을 공유하기 위한 SNS 기능 개발 <br />- 한국 관광공사
            캠핑장 정보 API를 통해 유저가 원하는 캠핑장 정보를 검색하고 필터를
            통해 조회
          </div>
        </div>
      </div>
      <!-- <p>
        I believe developers are people who can solve the problems that humans
        are experiencing.
      </p> -->
      <h5 class="my-5">View</h5>
    </div>

    <div class="bottom-box">
      <div class="portfolio-detail-image-boxes">
        <div class="portfolio-detail-image-box">
          <p class="picture-title">메인 페이지</p>
          <img
            class="portfolio-detail-image"
            src="@/assets/campus/main.gif"
            alt=""
          />
        </div>
        <div class="portfolio-detail-image-box">
          <p class="picture-title">캠핑 SNS</p>
          <img
            class="portfolio-detail-image"
            src="@/assets/campus/sns.gif"
            alt=""
          />
        </div>

        <div class="portfolio-detail-image-box">
          <p class="picture-title">캠핑 장소 조회</p>
          <img
            class="portfolio-detail-image"
            src="@/assets/campus/20220217225229.png"
            alt=""
          />
        </div>
        <div class="portfolio-detail-image-box">
          <p class="picture-title">캠핑 장소 조회</p>
          <img
            class="portfolio-detail-image"
            src="@/assets/campus/snsCreate.png"
            alt=""
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { reactive } from "vue";
export default {
  name: "Campus",
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
  font-weight: bold;
  font-family: "SF Pro Display", -apple-system, system-ui, BlinkMacSystemFont,
    "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}
a {
  color: black;
  // font-size: 1rem;
  text-decoration: none;
}

.campus-total-info-box {
  max-width: 1000px;
  margin: 0rem auto 0rem auto;
  //   display: flex;
  align-items: center;
}
.info-box {
  text-align: start;
  padding: 0rem 0rem 0rem 3rem;
  // background: #fafafa;
}
.portfolio-detail-info-title {
  margin: 0rem 0rem 1rem 0rem;
  font-weight: bold;
  color: rgb(50, 49, 49);
}
.portfolio-detail-info-content {
  margin: 0rem 0rem 1rem 0rem;
}
.portfolio-detail-info-box {
  display: flex;
  gap: 4rem;
  // align-items: center;
  // padding: 1rem 4rem 1rem 1rem;
}
.subinfo-box {
  margin: 2rem 0rem 0rem 0rem;
}
.bottom-box {
  max-width: 100vw;
  padding: 0rem 0rem 0rem 3rem;
}
.picture-title {
  font-size: 1.2rem;
  font-weight: bold;
  font-family: "SF Pro Display", -apple-system, system-ui, BlinkMacSystemFont,
    "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
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

.link-image {
  width: 2rem;
}
// .portfolio-detail-image-boxes {
//   display: grid;

//   //   grid-template-columns: repeat(1, 5fr);
// }
.btn.btn-dark {
  // border-radius: 24px;
  width: 8rem;
  font-weight: bold;
  font-size: 0.8rem;
  padding: 0.6rem;
  background: #363636;
  box-shadow: -4px -4px 10px rgb(255 255 255 / 80%),
    4px 4px 10px rgb(0 0 0 / 20%);
  & a {
    text-decoration: none;
    color: white;
  }
  &:hover {
    box-shadow: -4px -4px 10px rgb(255 255 255 / 80%),
      4px 4px 10px rgb(0 0 0 / 20%);
    background: #000000;
  }
}
.portfolio-detail-image-boxes {
  display: grid;
  gap: 4rem 2rem;
  grid-template-columns: repeat(2, 1fr);
}
.portfolio-detail-image-box {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  height: 100%;
}
.portfolio-detail-image {
  width: 100%;
  // height: 100%;
  // max-width: 300px;
  //   min-height: 250px;
  // object-fit: cover;
}
</style>
