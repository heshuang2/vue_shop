<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right" v-if="menuList.length !== 0">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>{{menuList[1].authName}}</el-breadcrumb-item>
      <el-breadcrumb-item>{{menuList[1].children[0].authName}}</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图-->
    <el-card>
      <!--添加角色按钮区域-->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!--角色列表区域-->
      <el-table :data="roleList" border stripe >
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="[ 'bdbottom',index1 === 0 ? 'bdtop' : '','v-center']"
                    v-for="(item1, index1) in scope.row.children" :key="item1.id">
              <!--渲染一级权限-->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">
                  {{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!--渲染二级三级权限-->
              <el-col :span="19">
                <el-row :class="[index2 === 0 ? '': 'bdtop', 'v-center']"
                        v-for="(item2, index2) in item1.children" :key="item2.id">
                  <!--二级权限-->
                  <el-col :span="6">
                    <el-tag type="success" closable
                            @close="removeRightById(scope.row, item2.id)">
                    {{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!--三级权限-->
                  <el-col :span="18">
                    <el-tag v-for="(item3, index3) in item2.children"
                            :key="item3.id" type="warning" closable
                            @close="removeRightById(scope.row, item3.id)">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"align="center"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"align="center"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"align="center"></el-table-column>
        <el-table-column  label="操作"align="center" width="300px">
          <template slot-scope="score">
              <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
              <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
              <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(score.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!--分配权限对话框-->
    <el-dialog
            title="分配权限"
            :visible.sync="setRightDialogVisible"
            width="50%" @close="setRightDialogClose">
      <el-tree :data="rightsList" :props="treeProps"
               show-checkbox node-key="id"
               default-expand-all :default-checked-keys="defKeys"
               ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
    <el-button @click="setRightDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="allotRight">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "Roles",
    data() {
      return {
      //    所有角色列表数据
        roleList: [],
        setRightDialogVisible: false,
        //所有权限的数据
        rightsList: [],
        //树形控件的属性绑定对象
        treeProps: {
          label: 'authName',
          children: 'children'
        },
        //默认选择的节点ID值数组
        defKeys: [],
        //当前即将分配权限的角色id
        roleId: '',
      }
    },
    computed: {
      menuList() {
        return this.$store.state.menuList;
      }
    },
    created() {
      this.getRolesList()
    },
    methods: {
      async getRolesList() {
        const {data: res} = await this.$http.get('roles');
        // console.log(res);
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
        this.roleList = res.data;
        console.log(this.roleList);
      },
      /*根据id删除对应权限*/
      async removeRightById(row, id) {
        const confirmResult = await this.$confirm('此操作将删除权限, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
          //catch捕获取消事件
        }).catch(err => err);
        //如果确认删除，返回字符串confirm
        //如果取消删除，返回字符串cancel
        // console.log(confirmResult);
        if (confirmResult !== 'confirm') {
          return this.$message.info("已取消删除");
        }
        const {data: res} = await this.$http.delete(`roles/${row.id}/rights/${id}`);
        if (res.meta.status !== 200) return this.$message.error("删除失败");
        row.children = res.data;
        this.$message.success(res.meta.msg);
      },
      //展示分配权限对话框
      async showSetRightDialog(role) {
        this.roleId = role.id;
        console.log(this.roleId);
        //获取所有权限的数据
        const {data: res} = await this.$http.get('rights/tree');
        // console.log(res);
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
        this.rightsList = res.data;
        // console.log(this.rightsList);
        //递归获取三级节点的id
        this.getLeafKeys(role, this.defKeys);
        this.setRightDialogVisible = true;
      },
      //通过递归的形式，获取角色下所有三级权限的id，保存到defKeys数组中
      getLeafKeys(node, arr) {
        //如果当前node节点不包含children属性，是三级节点
        if (!node.children) return arr.push(node.id);
        node.children.forEach(item => {
          this.getLeafKeys(item, arr)
        })
      },
      //权限对话框关闭
      setRightDialogClose() {
        this.defKeys = [];
      },
      //d点击为角色分配权限
      async allotRight() {
        const keys = [
                ...this.$refs.treeRef.getCheckedKeys(),
                ...this.$refs.treeRef.getHalfCheckedKeys(),
        ];
        // console.log(keys);
        const idStr = keys.join(',');
        const {data: res} = await this.$http.post(`roles/${this.roleId}/rights`, {rids: idStr});
        // console.log(res);
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
        this.$message.success(res.meta.msg);
        this.getRolesList();
        this.setRightDialogVisible = false;

      }
    }
  }
</script>

<style scoped>
  .el-tag {
    margin: 7px;
  }
  .bdbottom {
    border-bottom: 1px solid #eee;
  }
  .bdtop {
    border-top: 1px solid #eee;
  }
  .v-center {
    display: flex;
    align-items: center;
  }
</style>