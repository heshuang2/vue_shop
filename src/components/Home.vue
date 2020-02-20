<template>
  <div>
    主页
    <div>
      <el-button type="info" @click="logout">退出</el-button>
    </div>
  </div>
</template>

<script>
  export default {
    name: "Home",
    methods: {
      logout() {
        window.sessionStorage.clear();
        this.$router.push("/login")
      }
    }
  }
</script>

<style scoped>

</style>