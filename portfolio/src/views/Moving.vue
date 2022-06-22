<template>
  <div class="moving-total-info-box">
    <div class="info-box">
      <h1 class="my-5">Moving</h1>
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
            2021.11.17 ~ 2021.11.25
          </div>
          <div class="portfolio-detail-info-content">총 2명</div>
          <div class="portfolio-detail-info-content">
            영화 정보 기반 영화추천 서비스
          </div>
          <div class="portfolio-detail-info-content">
            Javascript, Vue 2, Bootstrap, Django, Sqlite3
          </div>
          <div class="portfolio-detail-info-content">
            <a
              href="https://github.com/daedaem/Moving_SSAFY-1th-Project"
              target="_blank"
            >
              <button type="button" class="btn btn-dark my-3">
                저장소로 이동 <i class="bi bi-arrow-right-short"></i>
              </button>
            </a>
          </div>
          <div class="portfolio-detail-info-content">
            <strong> 백엔드 개발</strong> <br />
            - Django를 통한 전체 모델링, Movie앱 개발 담당 <br />
            - Django rest framework를 통한 API 개발
            <br />
            <br />
            <strong> 프론트엔드 개발</strong>
            <br />
            - 영화 커뮤니티 TMDB 및 유튜브의 api 를 통한 영화 정보, 장르별 영화
            추천 서비스 제공 <br />
            - 영화 검색 기능 구현
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
          <p class="picture-title">메인페이지</p>
          <img
            class="portfolio-detail-image"
            src="@/assets/moving/Main.gif"
            alt=""
          />
        </div>

        <div class="portfolio-detail-image-box">
          <p class="picture-title">상세 페이지</p>
          <img
            class="portfolio-detail-image"
            src="@/assets/moving/detail.gif"
            alt=""
          />
        </div>
        <div class="portfolio-detail-image-box">
          <p class="picture-title">검색창 및 검색결과</p>
          <img
            class="portfolio-detail-image"
            src="@/assets/moving/searchbar.gif"
            alt=""
          />
        </div>
        <div class="portfolio-detail-image-box">
          <p class="picture-title">영화 추천 페이지</p>
          <img
            class="portfolio-detail-image"
            src="@/assets/moving/recommend.png"
            alt=""
          />
        </div>
      </div>
    </div>
    <!-- 
    <div class="bottom-box">
      <div class="portfolio-detail-image-box">
        <div class="col">
          <p class="picture-title">메인 페이지</p>
          <img
            class="portfolio-detail-image"
            src="@/assets/moving/Main.gif"
            alt=""
          />
        </div>
        <div class="row">
          <div class="col">
            <p class="picture-title">검색창 및 검색결과 페이지</p>
            <img
              class="portfolio-detail-image"
              src="@/assets/moving/searchbar.gif"
              alt=""
            />
            <div class="my-5">
              <p class="picture-title">영화 상세 페이지</p>
              <img
                class="portfolio-detail-image"
                src="@/assets/moving/detail.gif"
                alt=""
              />
            </div>
          </div>
        </div>
      </div>
    </div> -->
  </div>
</template>
<script>
import { reactive } from "vue";
export default {
  name: "Moving",
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

.moving-total-info-box {
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
.link-image {
  width: 2rem;
}

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
}

.portfolio-detail-image {
  width: 100%;
  // height: 100%;
  // max-width: 300px;
  //   min-height: 250px;
  // object-fit: cover;
}
</style>
