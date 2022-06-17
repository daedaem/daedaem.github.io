<template>
  <div class="total-info-box">
    <div class="info-box">
      <h1 class="my-5">Pairplay</h1>
      <div class="portfolio-detail-info-box">
        <h5>Info</h5>
        <div class="portfolio-detail-info-titles col-1">
          <div class="portfolio-detail-info-title">개발 기간</div>
          <div class="portfolio-detail-info-title">서비스</div>
          <div class="portfolio-detail-info-title">기술 스택</div>
          <div class="portfolio-detail-info-title">관련 링크</div>
          <div class="portfolio-detail-info-title">담당 업무</div>
        </div>
        <div class="portfolio-detail-info-contents col">
          <div class="portfolio-detail-info-content">
            2022.04.11 ~ 2022.05.20
          </div>
          <div class="portfolio-detail-info-content">
            전국 체육시설 조회, 예약 및 운동 메이트 중개 플랫폼
          </div>
          <div class="portfolio-detail-info-content">
            Javascript , Vue 3, Scss
          </div>
          <div class="portfolio-detail-info-content">
            <a href="https://pairplay.site/" target="_blan`k">
              https://pairplay.site/</a
            ><br />
          </div>
          <div class="portfolio-detail-info-content">
            <strong> 운동장소 메인페이지</strong> <br />
            - 운동 카테고리 선택, 회원 주소지 내 인기시설, 최근 조회한 시설 제공
            <br />
            <br />
            <strong> 운동장소 검색 페이지 </strong>
            <br />
            - 지역, 운동 종목, 사용 날짜 필터링 및 검색 기능 <br />- Naver Map
            api 활용한 위치기반 운동 시설 정보 제공
            <br />
            <br />
            <strong> 운동장소 상세페이지</strong> <br />- 시설 상세정보(평점,
            이용시간 및 금액, 시설정보, 위치, 이용 규칙, 리뷰 등) 제공 <br />-
            날짜별 이용 예약가능 시간 조회 및 아임포트 API를 활용한 예약기능<br />
          </div>
        </div>
      </div>
      <!-- <p>
        I believe developers are people who can solve the problems that humans
        are experiencing.
      </p> -->
      <h5 class="my-5">View</h5>
      <div class="container portfolio-detail-image-box">
        <div class="row">
          <div class="col-4">
            <img
              class="portfolio-detail-image"
              src="@/assets/pairplay/pairplayPlaceMain.png"
              alt=""
            />
          </div>
          <div class="col-4">
            <img
              class="portfolio-detail-image"
              src="@/assets/pairplay/pairplayPlaceDetail.png"
              alt=""
            />
          </div>
        </div>
        <div class="col-4">
          <!-- <img
            class="portfolio-detail-image"
            src="@/assets/pairplay/장소수정.gif"
            alt=""
          /> -->
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { reactive } from "vue";
export default {
  name: "Pairplay",
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
  //   height: 94vh;
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
// .portfolio-detail-image-box {
//   display: grid;

//   //   grid-template-columns: repeat(1, 5fr);
// }
.container.portfolio-detail-image-box {
  gap: 1rem;
}
.portfolio-detail-image {
  max-width: 300px;
  //   min-height: 250px;
  //   object-fit: cover;
}
</style>
