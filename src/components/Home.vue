<template>
    <el-container>
      <!--头部区域-->
      <el-header>
        <div>
          <img src="../assets/img/heima.png" alt="">
          <span>电商后台管理系统</span>
        </div>
        <el-button type="info" @click="logout">退出</el-button>
      </el-header>
      <!--主体区域-->
      <el-container>
        <!--侧边栏-->
        <el-aside :width="isCollapse ? '64px' : '200px'">
          <div class="toggle-button" @click="toggleCollapse">☲</div>
          <!--侧边栏菜单区-->
          <el-menu background-color="#273744"
                   text-color="#fff"
                   active-text-color="#409BFF"
                   unique-opened
                   :collapse="isCollapse"
                   :collapse-transition="false"
                   router
                   :default-active= "activePath">
            <!--一级菜单-->
            <el-submenu :index="item.id + ''"
                        v-for="(item, index) in menuList" :key="item.id">
              <!--一级菜单模板区域-->
              <template slot="title">
                <!--图标-->
                <i :class="iconObj[item.id]"></i>
                <!--文本-->
                <span>{{item.authName}}</span>
              </template>
              <!--二级菜单-->
              <el-menu-item :index= "'/' + subItem.path"
                            v-for="subItem in item.children"
                            :key="subItem.id" @click="saveNavState('/' + subItem.path)">
                <template slot="title">
                  <!--图标-->
                  <i class="el-icon-menu"></i>
                  <!--文本-->
                  <span>{{subItem.authName}}</span>
                </template>
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <!--主体内容-->
        <el-main>
          <!--路由占位符-->
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
</template>

<script>
  export default {
    name: "Home",
    components: {

    },
    data() {
      return {
        menuList: [],
        //item.id作为数组下标
        iconObj: {
          '125': "iconfont icon-user",
          '103': "iconfont icon-tijikongjian",
          '101': "iconfont icon-shangpin",
          '102': "iconfont icon-danju",
          '145': "iconfont icon-baobiao",
        },
        isCollapse: false,
        //被激活的链接地址
        activePath: ""
      }
    },
    created() {
      this.getMenuList();
      this.activePath = window.sessionStorage.getItem("activePath");
    },
    methods: {
      logout() {
        window.sessionStorage.clear();
        this.$router.push("/login")
      },
      //获取所有的菜单数据
      async getMenuList() {
        const {data: res} = await this.$http.get("menus");
        if(res.meta.status !== 200) return  this.$message.error(res.meta.msg);
        this.menuList = res.data;
        this.$store.state.menuList = res.data;
        console.log(this.$store.state.menuList);
      },
      toggleCollapse() {
        this.isCollapse = !this.isCollapse;
      },
      saveNavState(activePath) {
        window.sessionStorage.setItem('activePath', activePath);
        this.activePath = activePath;
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-container {
    height: 100%;
  }
  .el-header {
    background-color: #304141;
    display: flex;
    justify-content: space-between;
    padding-left: 10px;
    align-items: center;
    color: #fff;
    font-weight: bold;
    font-size: 20px;
    > div {
      display: flex;
      align-items: center;
      span {
        margin-left: 15px;
      }
    }
  }
  .el-aside {
    background-color: #273744;
    .el-menu {
      border: none
    }
  }
  .el-main {
    background-color: #eaedf1;
  }
  .iconfont {
    margin-right: 10px;
  }
  .toggle-button {
    background-color: #4A5064;
    color: #fff;
    font-size: 20px;
    line-height: 24px;
    text-align: center;
    cursor: pointer;
  }
</style>