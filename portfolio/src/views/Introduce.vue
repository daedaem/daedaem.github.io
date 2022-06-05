<template>
  <div class="accordion" id="accordionPanelsStayOpenExample">
    <div class="accordion-item">
      <h2 class="accordion-header" id="panelsStayOpen-headingOne">
        <button
          class="accordion-button"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#panelsStayOpen-collapseOne"
          aria-expanded="true"
          aria-controls="panelsStayOpen-collapseOne"
        >
          Q. 프로그래밍을 시작한 계기는 무엇인가요?
        </button>
      </h2>
      <div
        id="panelsStayOpen-collapseOne"
        class="accordion-collapse collapse show"
        aria-labelledby="panelsStayOpen-headingOne"
      >
        <div class="accordion-body text-start">
          <p>
            '프로그래밍은 인류가 직면한 문제를 해결 할 수 있다고 믿습니다.'
            석사과정 중 IBM의 의료용 AI 플랫폼 '왓슨' 을 통한 70% 연구시간 감축
            경험은 프로그래밍 힘을 깨닫게 된 계기가 되었습니다.
          </p>
          <p>
            SSAFY(삼성청년소프트웨어아카데미)에서의 3번의 프로젝트 경험을 통해
            이 믿음에 대한 확신을 갖게 되어 개발자의 길을 걷고 있습니다.
          </p>
        </div>
      </div>
    </div>
    <div class="accordion-item">
      <h2 class="accordion-header" id="panelsStayOpen-headingTwo">
        <button
          class="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#panelsStayOpen-collapseTwo"
          aria-expanded="false"
          aria-controls="panelsStayOpen-collapseTwo"
        >
          Accordion Item #2
        </button>
      </h2>
      <div
        id="panelsStayOpen-collapseTwo"
        class="accordion-collapse collapse"
        aria-labelledby="panelsStayOpen-headingTwo"
      >
        <div class="accordion-body">
          <strong>This is the second item's accordion body.</strong> It is
          hidden by default, until the collapse plugin adds the appropriate
          classes that we use to style each element. These classes control the
          overall appearance, as well as the showing and hiding via CSS
          transitions. You can modify any of this with custom CSS or overriding
          our default variables. It's also worth noting that just about any HTML
          can go within the <code>.accordion-body</code>, though the transition
          does limit overflow.
        </div>
      </div>
    </div>
    <div class="accordion-item">
      <h2 class="accordion-header" id="panelsStayOpen-headingThree">
        <button
          class="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#panelsStayOpen-collapseThree"
          aria-expanded="false"
          aria-controls="panelsStayOpen-collapseThree"
        >
          Accordion Item #3
        </button>
      </h2>
      <div
        id="panelsStayOpen-collapseThree"
        class="accordion-collapse collapse"
        aria-labelledby="panelsStayOpen-headingThree"
      >
        <div class="accordion-body">
          <strong>This is the third item's accordion body.</strong> It is hidden
          by default, until the collapse plugin adds the appropriate classes
          that we use to style each element. These classes control the overall
          appearance, as well as the showing and hiding via CSS transitions. You
          can modify any of this with custom CSS or overriding our default
          variables. It's also worth noting that just about any HTML can go
          within the <code>.accordion-body</code>, though the transition does
          limit overflow.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Introduce",
};
</script>

<style></style>
