<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right" v-if="menuList.length !== 0">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>{{menuList[0].authName}}</el-breadcrumb-item>
      <el-breadcrumb-item>{{menuList[0].children[0].authName}}</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区域-->
    <el-card class="box-card">
      <!--搜索与添加区域-->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query"
                    clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search"
                       @click="getUserList">
            </el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!--用户列表区域-->
      <el-table :data="userList" style="width: 100%"
              :row-class-name="tableRowClassName" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <!--作用域插槽-->
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column width="125px" label="操作">
          <template slot-scope="scope">
            <el-tooltip content="修改" placement="top" :enterable="false">
              <el-button size="mini" type="primary" icon="el-icon-edit"
                         circle @click="showEditDialog(scope.row.id)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top" :enterable="false">
              <el-button size="mini" type="danger" icon="el-icon-delete"
                         circle @click="removeUser(scope.row.id)"></el-button>
            </el-tooltip>
            <el-tooltip content="分配角色" placement="top" :enterable="false">
              <el-button size="mini" type="warning" icon="el-icon-setting"
                         circle @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--分页区域-->
      <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="queryInfo.pagenum"
              :page-sizes="[1, 2, 5, 10]"
              :page-size="queryInfo.pagesize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total">
      </el-pagination>
    </el-card>
    <!--添加用户对话框-->
    <el-dialog
            title="添加用户"
            :visible.sync="addDialogVisible"
            width="50%" @close="addDialogClose">
      <!--内容主题区域-->
      <dialog-view ref="dialogs"></dialog-view>
      <!--底部区域-->
      <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addUser">确 定</el-button>
  </span>
    </el-dialog>
    <!--修改用户的对话框-->
    <el-dialog
            title="修改用户"
            :visible.sync="editDialogVisible"
            width="50%" @close="editDialogClosed">
      <el-form ref="editFormRef" :model="editForm" :rules="editFromRules"
               label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editUserInfo">确 定</el-button>
  </span>
    </el-dialog>
    <!--分配角色的对话框-->
    <el-dialog
            title="分配角色"
            :visible.sync="setRoleDialogVisible"
            width="50%"  @close="setRoleDialogClose">
      <div>
        <div class="box-mg">
          <span class="span-box">当前的用户: </span>
          <el-input class="color-input" :value="userInfo.username" disabled>
          </el-input>
        </div>
       <div class="box-mg">
         <span class="span-box">当前的角色: </span>
         <el-input class="color-input" :value="userInfo.role_name" disabled>
         </el-input>
       </div>
        <div class="box-mg">
          <span class="span-box">分配新角色: </span>
          <el-select v-model="selectedRoleId"  placeholder="请选择">
            <el-option v-for="item in rolesList" :key="item.id"
                       :label="item.roleName" :value="item.id"></el-option>
          </el-select>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import DialogView from "./childComps/DialogView";
  import {checkEmail, checkMobile} from "../../common/utils"
  export default {
    name: "User",
    components: {DialogView},
    data() {
      return {
        //获取用户列表的参数对象
        queryInfo: {
          //搜索关键字
          query: '',
          //当前页码
          pagenum: 1,
          //每页显示多少数据
          pagesize: 2
        },
        //用户列表数据
        userList: [],
        total: 0,
        addDialogVisible: false,
        editDialogVisible: false,
        //查询到的用户信息保存
        editForm: {},
        //修改表单验证规则
        editFromRules: {
          email: [
            {required: true, message: "请输入用户邮箱", trigger: "blur"},
            {validator: checkEmail, trigger: "blur"}
          ],
          mobile: [
            {required: true, message: "请输入用户手机号", trigger: "blur"},
            {validator: checkMobile, trigger: "blur"}
          ]
        },
        setRoleDialogVisible: false,
        //需要被分配角色的用户信息
        userInfo: {},
        //角色列表数据
        rolesList: [],
        //已选中的角色
        selectedRoleId: ''
      }
    },
    created() {
      this.getUserList();
    },
    computed: {
      menuList() {
        return this.$store.state.menuList;
      }
    },
    methods: {
      //获取数据
      async getUserList() {
        const {data: res} = await this.$http.get
        ('users', { params:  this.queryInfo });
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg);
        }
        this.userList = res.data.users;
        this.total = res.data.total;
        // console.log(res);
      },
      tableRowClassName({row, rowIndex}) {
        if (rowIndex === 1) {
          return 'warning-row';
        } else if (rowIndex === 3) {
          return 'success-row';
        }
        return '';
      },
      //监听pageSize改变的事件
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize;
        this.getUserList()
      },
      //监听页码改变的事件
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage;
        this.getUserList();
      },
      //监听switch 开关状态的改变
      async userStateChange(userInfo) {
        const {data: res} = await this.$http.put
        (`users/${userInfo.id}/state/${userInfo.mg_state}`);
        console.log(res);
        if (res.meta.status === 200)
          return this.$message.success(res.meta.msg);
        else {
          userInfo.mg_state = !userInfo.mg_state;
          return this.$message.error('更新用户状态失败');
        }
      },
      //监听添加用户框的关闭事件
      addDialogClose() {
        this.$refs.dialogs.close();
      },
      //点击按钮，添加新用户
      addUser() {
        this.$refs.dialogs.$refs.addFormRef.validate(async valid => {
          console.log(valid);
          if (!valid) return;
          //可以发起添加用户的网络请求
          const {data: res} = await this.$http.post
          ("users", this.$refs.dialogs.addFrom);
          console.log(res);
          if(res.meta.status !== 201) {
            this.$message.error(res.meta.msg);
          }
          this.$message.success(res.meta.msg);

          this.addDialogVisible = false;
          this.getUserList();
        });
      },
      //修改用户的对话框
      async showEditDialog(id) {
        const {data: res} = await this.$http.get("users/" + id);
        console.log(res);
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg);
        }
        this.editForm = res.data;
        this.editDialogVisible = true;
        // console.log(id);
      },
      //监听修改用户对话框的关闭事件
      editDialogClosed() {
        this.$refs.editFormRef.resetFields();
      },
      //修改用户信息并提交
      editUserInfo() {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return;
          const {data: res} = await this.$http.put
          ("users/" + this.editForm.id, {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          });
          console.log(res);
          if(res.meta.status !== 201) {
            this.$message.error(res.meta.msg);
          }
          this.editDialogVisible = false;
          this.$message.success(res.meta.msg);
          this.getUserList();
        })
      },
      //根据id删除用户数据
      async removeUser(id){
        const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
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
        const {data: res} = await this.$http.delete("users/" + id);
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg);
        }
        this.$message.success(res.meta.msg);
        this.getUserList();
      },
      //展示分配角色的对话框
      async setRole(userInfo) {
        this.userInfo = userInfo;
        // console.log(this.userInfo);
        //获取角色列表
        const {data: res} = await this.$http.get('roles');

        if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
        this.rolesList = res.data;
        // console.log(this.rolesList);
        this.setRoleDialogVisible = true;
      },
      //点击按钮，分配角色
      async saveRoleInfo() {
        if (!this.selectedRoleId) return this.$message.error('请选择要分配的角色');
        const {data: res} = await this.$http.put(`users/
        ${this.userInfo.id}/role`, {
          rid: this.selectedRoleId
        });
        console.log(res);
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
        this.getUserList();
        this.setRoleDialogVisible = false;
        this.$message.success(res.meta.msg);
      },
      //监听分配角色对话框的关闭事件
      setRoleDialogClose() {
        this.selectedRoleId = "";
        this.userInfo = "";
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-table .warning-row {
    background: oldlace;
  }

  .el-table .success-row {
    background: #f0f9eb;
  }
  .color-input > {
    color: #000!important;
    width: 120px;

  }
  .span-box {
    display: block;
    float: left;
    border-radius: 5px;
    border: 1px solid #ccc;
    height: 38px;
    width: 90px;
    text-align: center;
    line-height: 40px;
    font-family: "Microsoft YaHei", "微软雅黑";
    font-weight: 800;
    margin-right: 2px;
    background-color: #F5F7FA;
  }
  .box-mg {
    margin: 10px 0;
  }

</style>