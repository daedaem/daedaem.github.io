<template>
  <div class="total-portfolio-box">
    <div class="portfolio-content-box">
      <h3 class="pt-5">PORTFOLIO</h3>
      <!-- <p class="fs-5">보유 기술 및 사용 언어</p> -->
      <div class="hr-1"></div>
      <div class="portfolio-boxes">
        <div class="portfolio-box text-start">
          <div class="portfolio-box-content col-4">
            <!-- <p class="fs-5 mb-0 fw-bold">Pairplay</p> -->
            <img
              class="portfolio-logo-image me-auto"
              src="@/assets/pairplay/PairPlayLogo.png"
              style="width: 200px"
              alt=""
            />
            <p></p>
            <div class="portfolio-content-description">
              전국 체육시설 조회, 예약 및 운동 메이트 중개 플랫폼
            </div>
            <div class="mt-4">2022.04.11 ~ 2022.05.20</div>
            <!-- <div class="my-3 skilbutton"> -->
            <!-- <img v-for="link in logos" :key="link.id" :src="`${link}`" /> -->
            <!-- </div> -->
            <a href="https://github.com/daedaem/Pairplay" target="_blank">
              <button type="button" class="btn btn-dark mt-5">
                저장소로 이동 <i class="bi bi-arrow-right-short"></i>
              </button>
            </a>
          </div>
          <div>
            <img
              class="portfolio-box-image"
              style="width: 400px"
              src="@/assets/pairplay/pairplayMain.png"
              alt=""
            />
          </div>
          <!-- <p>아아</p> -->
        </div>
        <div class="portfolio-box text-start">
          <div class="portfolio-box-content col-4">
            <!-- <p class="fs-5 mb-0 fw-bold">Pairplay</p> -->
            <img
              class="portfolio-logo-image me-auto"
              src="@/assets/unique/UniqueLogo.png"
              style="width: 150px"
              alt=""
            />
            <p></p>
            <div class="portfolio-content-description">
              NFT 민팅, 거래 및 전시회 플랫폼
            </div>
            <div class="mt-4">2022.02.28 ~ 2022.04.08</div>
            <!-- <div class="my-3 skilbutton"> -->
            <!-- <img v-for="link in logos" :key="link.id" :src="`${link}`" /> -->
            <!-- </div> -->
            <a
              href="https://github.com/daedaem/Unique-NFT_MarketExhibition"
              target="_blank"
            >
              <button type="button" class="btn btn-dark mt-5">
                저장소로 이동 <i class="bi bi-arrow-right-short"></i>
              </button>
            </a>
          </div>
          <div>
            <img
              class="portfolio-box-image"
              style="width: 400px"
              src="@/assets/unique/uniqieMain.png"
              alt=""
            />
          </div>
          <!-- <p>아아</p> -->
        </div>
        <div class="portfolio-box text-start">
          <div class="portfolio-box-content col-4">
            <!-- <p class="fs-5 mb-0 fw-bold">Pairplay</p> -->
            <img
              class="portfolio-logo-image me-auto"
              src="@/assets/campus/campusLogo.png"
              style="width: 150px"
              alt=""
            />
            <p></p>
            <div class="portfolio-content-description">
              캠핑 SNS, 캠핑시설 조회, 캠핑 메이트 중개 서비스
            </div>
            <div class="mt-4">2022.01.04 ~ 2022.02.18</div>
            <!-- <div class="my-3 skilbutton"> -->
            <!-- <img v-for="link in logos" :key="link.id" :src="`${link}`" /> -->
            <!-- </div> -->
            <a href="https://github.com/daedaem/Campus" target="_blank">
              <button type="button" class="btn btn-dark mt-5">
                저장소로 이동 <i class="bi bi-arrow-right-short"></i>
              </button>
            </a>
          </div>

          <div>
            <img
              class="portfolio-box-image"
              style="width: 400px"
              src="@/assets/campus/campusMain.png"
              alt=""
            />
          </div>
          <!-- <p>아아</p> -->
        </div>
        <div class="portfolio-box text-start">
          <div class="portfolio-box-content col-4">
            <!-- <p class="fs-5 mb-0 fw-bold">Pairplay</p> -->
            <img
              class="portfolio-logo-image me-auto"
              src="@/assets/moving/MovingLogo.png"
              style="width: 170px"
              alt=""
            />
            <p></p>
            <div class="portfolio-content-description">
              영화 정보 기반 추천 서비스
            </div>
            <div class="mt-4">2021.11.17 ~ 2021.11.25</div>
            <!-- <div class="my-3 skilbutton"> -->
            <!-- <img v-for="link in logos" :key="link.id" :src="`${link}`" /> -->
            <!-- </div> -->
            <a
              href="https://github.com/daedaem/Moving_SSAFY-1th-Project"
              target="_blank"
            >
              <button type="button" class="btn btn-dark mt-5">
                저장소로 이동 <i class="bi bi-arrow-right-short"></i>
              </button>
            </a>
          </div>

          <div>
            <img
              class="portfolio-box-image"
              style="width: 400px"
              src="@/assets/moving/MovingMain.png"
              alt=""
            />
          </div>
          <!-- <p>아아</p> -->
        </div>
      </div>
    </div>
  </div>
</template>
<script>
// import { reactive } from "@vue/reactivity";
export default {
  name: "Portfolio",
  setup() {
    // const logos = reactive([]);
    // return { logos };
  },
};
</script>
<style lang="scss" scoped>
.total-portfolio-box {
  //   height: 100vh;
  max-width: 1000px;
  //   background: #fafafa;

  margin: 5rem auto 5rem auto;

  //   width: 99vw;
}
.portfolio-content-box {
  //   max-width: 1200px;
  //   padding: rem 0rem 0rem 0rem;
  margin: 1rem auto 0 auto;
}
.hr-1 {
  width: 20%;
  margin: 1rem auto 2rem auto;
  //   padding: 0rem auto 0rem auto;
  //   color: rgb(0, 0, 0, 0.4);
  border-bottom: 1px solid white;
}
.portfolio-boxes {
  max-width: 980px;

  margin: 0rem auto 0rem auto;
  display: grid;
  grid-gap: 2rem;
  grid-template-columns: repeat(1, 1fr);
}
.portfolio-box {
  //   min-height: 350px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 100%;
  background: radial-gradient(145% 145.46% at 0% 0%, #fff 0%, #eee 100%);
  box-shadow: 20px 20px 60px rgb(0 0 0 / 5%),
    -20px -20px 60px rgb(255 255 255 / 80%);
  border-radius: 20px;
  //   margin: 0 auto 0 auto;
  padding: 1.3rem 1.3rem 1.3rem 1.3rem;
  //   max-width: 350px;
}
// .portfolio-box-image{

// }
.portfolio-box-content {
  //   display: flex;
  //   flex-direction: column;
  //   align-items: stretch;
  margin: 1.5rem 0rem 1.5rem 0rem;
}
// .portfolio-logo-image {
//   margin: 0rem 0 0rem 0;
// }
.portfolio-content-description {
  font-weight: bold;
  font-size: 1.1rem;
}
.skilbutton {
  //   display: g
  //   grid-gap: rem;
  grid-template-columns: repeat(3, 1fr);
}
.bi-star-fill {
  color: #fe8a01;
  font-size: 0.8rem;
  margin: 0rem 0.25rem 1rem 0.25rem;
}
.btn.btn-dark {
  border-radius: 24px;
  width: 10rem;
  font-weight: bold;
  font-size: 0.8rem;
  padding: 0.75rem 1.5rem;
  background: #363636;
  box-shadow: -4px -4px 10px rgb(255 255 255 / 80%),
    4px 4px 10px rgb(0 0 0 / 20%);
  & a {
    text-decoration: none;
    color: white;
  }
}
</style>
