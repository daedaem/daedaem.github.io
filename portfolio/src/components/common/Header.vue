<template>
  <nav class="navbar navbar-expand-lg">
    <div class="container-fluid">
      <a class="navbar-brand name" href="/">ㅈㅎㅅ</a>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
        <ul class="navbar-nav">
          <li>
            <router-link :to="{ name: 'About' }" class="nav-link"
              >About Me</router-link
            >
            <!-- <a class="nav-link" href="/about">About Me</a> -->
          </li>
          <li class="nav-item">
            <router-link :to="{ name: 'Skills' }" class="nav-link"
              >Skills</router-link
            >
          </li>
          <li
            class="d-none d-lg-inline-block dropdown"
            style="font-weight: bold"
          >
            <ul
              class="dropdown-menu card-generic card-generic-s3 dropdown-menu-end mt-2"
            >
              <li>
                <p class="dropdown-item" @click="moveToPairplay()">Pairplay</p>
                <!-- <router-link :to="{ name: 'Pairplay' }" class="nav-link"
                  >Pairplay</router-link
                > -->
              </li>
              <li>
                <p class="dropdown-item" @click="moveToUnique()">Unique</p>
              </li>
              <li>
                <p class="dropdown-item" @click="moveToCampus()">Campus</p>
              </li>
              <li>
                <p class="dropdown-item" @click="moveToMoving()">Moving</p>
              </li>
              <!-- <li><router-link class="dropdown-item card-generic-item" :to="`/account/${userId}`"><em class="ni me-2 ni-setting"></em>Account Settings</router-link></li> -->
            </ul>
          </li>
          <li class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle"
              href="#"
              id="navbarDropdownMenuLink"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              @click="moveToPortfolio()"
            >
              Portfolio
            </a>
            <ul class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
              <li>
                <p class="dropdown-item" @click="moveToPairplay()">
                  프로젝트1. <em class="fw-bold"> Pairplay</em>
                </p>
              </li>
              <li>
                <p class="dropdown-item" @click="moveToUnique()">
                  프로젝트2. <em class="fw-bold"> Unique</em>
                </p>
              </li>
              <li>
                <p class="dropdown-item" @click="moveToCampus()">
                  프로젝트3. <em class="fw-bold"> Campus</em>
                </p>
              </li>
              <li>
                <p class="dropdown-item" @click="moveToMoving()">
                  프로젝트4. <em class="fw-bold"> Moving</em>
                </p>
              </li>
            </ul>
          </li>

          <li class="nav-item">
            <router-link :to="{ name: 'Experiences' }" class="nav-link"
              >Experiences</router-link
            >
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import { useRouter } from "vue-router";
export default {
  name: "Header",
  setup() {
    const router = useRouter();
    const moveToPortfolio = () => {
      router.push({
        name: "Portfolio",
      });
    };
    const moveToPairplay = () => {
      router.push({
        name: "Pairplay",
      });
    };
    const moveToUnique = () => {
      router.push({
        name: "Unique",
      });
    };
    const moveToCampus = () => {
      router.push({
        name: "Campus",
      });
    };
    const moveToMoving = () => {
      router.push({
        name: "Moving",
      });
    };
    return {
      moveToPortfolio,
      moveToPairplay,
      moveToUnique,
      moveToCampus,
      moveToMoving,
    };
  },
};
</script>

<style lang="scss" scoped>
nav {
  // padding: 30px;

  a {
    // font-weight: bold;
    // color: #2c3e50;
  }
}
.navbar {
  background: transparent;
  // height: 100px;
  & .name {
    font-family: "SF Pro Display", -apple-system, system-ui, BlinkMacSystemFont,
      "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    font-size: 3rem;
    // color: black;
  }
}
.container-fluid {
  max-width: 1000px;
}
.nav-link.portfolio-link:hover {
  .dropdown-menu {
    display: block;
  }
}
.dropdown-item {
  cursor: pointer;
}
</style>
