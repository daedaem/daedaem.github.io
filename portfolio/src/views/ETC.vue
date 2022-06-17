<template>
  <div class="total-ETC-box container-fluid">
    <h3 class="info-title">ETC</h3>
    <p class="fs-5">개발 외 이력사항</p>
    <div class="hr-1"></div>
    <div class="total-ETC-content-box">
      <div class="pt-5">
        <div class="text-center col">
          <h5 class="fw-bold">Research</h5>
          <div class="text-start mt-4 d-flex justify-content start my-5">
            <div class="col-8 me-5">
              <p class="mb-1 fs-5">
                Lactate consumption mediates repeated high-intensity interval
                exercise-enhanced executive function in adult males.
              </p>
              <p class="my-0">2020 Dec, Phys Act Nutr.</p>
              <p class="my-0">
                Hae-Sung Cho 1, Won Sang Lee 1, Kyeong Jin Yoon 1, Soo Hong Park
                1, Hyung Eun Shin 2, Yeon-Soo Kim 1 3, Hyukki Chang 4, Hyo Youl
                Moon 1 3 5
              </p>
            </div>
            <div>
              <img src="@/assets/etc/lactate.png" alt="" style="width: 200px" />
            </div>
          </div>
          <div class="text-start mt-4 d-flex justify-content start my-5">
            <div class="col-8 me-5">
              <p class="mb-1 fs-5">
                Exercise-induced changes of gene expression in the cerebellum of
                aged mice.
              </p>
              <p class="my-0">
                Biochemical and biophysical research communications, Volume 521,
                Issue 4, 22 January 2020, Pages 952-956.
              </p>
              <p class="my-0">
                Minchul Lee, Hae-Sung Cho, Kyeong Jin Yoon, WonSang Lee, Hyo
                Youl Moon
              </p>
            </div>
            <div>
              <img
                src="@/assets/etc/cerebellum.png"
                alt=""
                style="width: 200px"
              />
            </div>
          </div>
          <div class="text-start mt-4 d-flex justify-content start my-5">
            <div class="col-8 me-5">
              <p class="mb-1 fs-5">
                Exercise-induced Extracellular Vesicles’ Effect on Stress.
              </p>
              <p class="my-0">April 2020, The FASEB Journal.</p>
              <p class="my-0">
                Kyeong Jin Yoon, Hae-Sung Cho, WonSang Lee, HyoYoul Moon
              </p>
            </div>
            <div>
              <img src="@/assets/etc/EV.png" alt="" style="width: 200px" />
            </div>
          </div>
          <div class="text-start mt-4 d-flex justify-content start my-5">
            <div class="col-8 me-5">
              <p class="mb-1 fs-5">
                Neural maturation enhanced by exercise-induced extracellular
                derivatives.
              </p>
              <p class="my-0">March 2020, Scientific Reports.</p>
              <p class="my-0">
                Hyo Youl Moon 1 2 3, Kyeong Jin Yoon 1, Won Sang Lee 1, Hae-Sung
                Cho 1, Do-Yeon Kim 4, Ji-Seok Kim 5
              </p>
            </div>
            <div>
              <img
                src="https://i1.rgstatic.net/publication/339664020_Neural_maturation_enhanced_by_exercise-induced_extracellular_derivatives/links/5fb67f30299bf104cf5b8178/largepreview.png"
                alt=""
                style="width: 200px"
              />
            </div>
          </div>
          <div class="text-start mt-4 d-flex justify-content start my-5">
            <div class="col-8 me-5">
              <p class="mb-1 fs-5">
                The Role of Dopamine Receptor D2 in Bridging the
                Intention-Behavior Gap in Sport Participation.
              </p>
              <p class="my-0">
                March 2021 International Journal of Environmental Research and
                Public Health.
              </p>
              <p class="my-0">
                Seiyeong Park 1, Junhye Kwon 1, Chiyoung Ahn 1, Hae-Sung Cho 1,
                Hyo Youl Moon 1, Chung Gun Lee 1
              </p>
            </div>
            <div>
              <img
                src="https://i1.rgstatic.net/publication/339664020_Neural_maturation_enhanced_by_exercise-induced_extracellular_derivatives/links/5fb67f30299bf104cf5b8178/largepreview.png"
                alt=""
                style="width: 200px"
              />
            </div>
          </div>
          <div class="text-start mt-4 d-flex justify-content start my-5">
            <div class="col-8 me-5 mb-5">
              <p class="mb-1 fs-5">
                Effects of treadmill exercise on the regulation of tight
                junction proteins in aged mice.
              </p>
              <p class="my-0">2020 Nov, Exp Gerontol.</p>
              <p class="my-0">
                Hyung Eun Shin 1, Seong Eun Kwak 1, Di Di Zhang 1, Jihyun Lee 1,
                Kyeong Jin Yoon 1, Hae Sung Cho 1, Hyo Youl Moon 2, Wook Song 3
              </p>
            </div>
            <div>
              <img
                src="@/assets/etc/tight_junction.png"
                alt=""
                style="width: 200px"
              />
            </div>
          </div>
        </div>
        <div class="v-line"></div>
      </div>
    </div>
  </div>
</template>
<script>
// import { reactive } from "vue";
export default {
  name: "ETC",
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

.total-ETC-box {
  //   max-width: 1200px;
  //   max-width: 1000px;
  //   background: #424242;
  margin: 5rem auto 1rem auto;

  //   width: 99vw;
}
.total-ETC-content-box {
  max-width: 1000px;
  border-radius: 20px;
  margin: 0rem auto 0rem auto;
  padding: 0rem 4rem 0 4rem;
  background: radial-gradient(145% 145.46% at 0% 0%, #fff 0%, #eee 100%);
  box-shadow: 20px 20px 60px rgb(0 0 0 / 5%),
    -20px -20px 60px rgb(255 255 255 / 80%);
}
.info-title {
  width: 30%;
  margin: auto;
}
.ETC-content-box {
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
.ETC-content {
  padding: 0rem 0rem 3rem 0rem;
}
</style>
