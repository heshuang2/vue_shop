<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right" v-if="menuList.length !== 0">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>{{menuList[1].authName}}</el-breadcrumb-item>
      <el-breadcrumb-item>{{menuList[1].children[1].authName}}</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图-->
    <el-card>
      <el-table :data="rightsList" border stripe >
        <el-table-column type="index" label="#"align="center"></el-table-column>
        <el-table-column prop="authName" label="权限名称" align="center"></el-table-column>
        <el-table-column prop="path" label="路径" align="center"></el-table-column>
        <el-table-column prop="level" label="权限等级" align="center">
          <template slot-scope=scope>
            <el-tag v-if="scope.row.level === '0'" effect="dark">一级</el-tag>
            <el-tag v-else-if="scope.row.level === '1'" type="success" effect="dark">二级</el-tag>
            <el-tag v-else type="warning" effect="dark">三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
  export default {
    name: "Rights",
    data() {
      return {
        //权限列表
        rightsList: []
      }
    },
    computed: {
      menuList() {
        return this.$store.state.menuList;
      }
    },
    created() {
      this.getRightsList()
    },
    methods: {
      async getRightsList() {
        const {data: res} = await this.$http.get('rights/list');
        // console.log(res);
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
        this.rightsList = res.data;
        console.log(this.rightsList);
      }
    }
  }
</script>

<style lang="less" scoped>

</style>