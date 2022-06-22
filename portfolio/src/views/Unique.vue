<template>
  <div class="unique-total-info-box">
    <div class="info-box">
      <h1 class="my-5">Unique</h1>
      <div class="portfolio-detail-info-box">
        <h5>Info</h5>
        <div class="portfolio-detail-info-titles col-1">
          <div class="portfolio-detail-info-title">개발 기간</div>
          <div class="portfolio-detail-info-title">개발 인원</div>
          <div class="portfolio-detail-info-title">서비스</div>
          <div class="portfolio-detail-info-title">담당 기술</div>
          <br /><br /><br /><br />
          <div class="portfolio-detail-info-title">관련 링크</div>
          <br /><br />
          <div class="portfolio-detail-info-title">담당 업무</div>
        </div>
        <div class="portfolio-detail-info-contents col">
          <div class="portfolio-detail-info-content">
            2022.02.28 ~ 2022.04.08
          </div>
          <div class="portfolio-detail-info-content">
            총 4명(백엔드 2명, 프론트엔드 2명)
          </div>
          <div class="portfolio-detail-info-content">
            NFT 작품과 작가를 소개하는 <em class="fw-bold"> NFT 예술관</em> /
            NFT 예비 예술가들의 <em class="fw-bold"> NFT 마켓플레이스</em>
          </div>
          <div class="portfolio-detail-info-content">
            <em class="fw-bold">Frontend</em>
            <p>Javascript, Vue 2, Scss, bootstrap, Figma</p>
            <em class="fw-bold">Blcokchain</em>
            <p class="mb-4">ganache, truffle, solidity, web3.js</p>
          </div>
          <div class="portfolio-detail-info-content">
            <a
              href="https://github.com/daedaem/Unique-NFT_MarketExhibition"
              target="_blank"
            >
              <button type="button" class="btn btn-dark">
                저장소로 이동 <i class="bi bi-arrow-right-short"></i>
              </button>
            </a>
          </div>
          <br />
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
            - Vue.js를 활용하여 메인페이지, 지갑과 토큰 발급 및 조회 페이지, NFT
            생성 및 판매 페이지, NFT 마켓페이지, NFT Exhibition 구현 <br />-
            Figma를 활용하여 와이어 프레임(메인 페이지, 마켓페이지, NFT
            상세페이지, NFT 민팅 및 판매 페이지) 제작
            <br />
            <br />
            <strong> 3. 블록체인 네트워크 및 스마트컨트랙트</strong> <br />-
            ganache 및 truffle을 활용한 로컬 블록체인 네트워크 구축 <br />-
            truffle과 javascript를 활용하여 SSAFY 프라이빗 네트워크(Besu)에
            스마트 컨트랙트 배포<br />
            - Solidity를 활용한 openzeppelin의 토큰 표준 erc20, erc721 기반의
            스마트 컨트랙트 구현(NFT 생성, SaleFactory 생성(구매 및 판매))
            <br />- web3.js를 이용한 SSAFY Network와 연결 및 스마트 컨트랙트
            호출(NFT 생성, 거래, 지갑 생성 및 조회, 토큰 발행 및 조회 등)<br />
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
            src="@/assets/unique/MainPage.gif"
            alt=""
          />
        </div>

        <div class="portfolio-detail-image-box">
          <p class="picture-title">마켓 리스트</p>
          <img
            class="portfolio-detail-image"
            src="@/assets/unique/NFTMarketList.gif"
            alt=""
          />
        </div>
        <div class="portfolio-detail-image-box">
          <p class="picture-title">NFT 민팅</p>
          <img
            class="portfolio-detail-image"
            src="@/assets/unique/nftCreate.gif"
            alt=""
          />
        </div>
        <div class="portfolio-detail-image-box">
          <p class="picture-title">NFT 전시회</p>
          <img
            class="portfolio-detail-image"
            src="@/assets/unique/Exhibition.gif"
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
  name: "Unique",
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

.unique-total-info-box {
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
</style>
