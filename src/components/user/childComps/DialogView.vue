<template>
  <div id="dialog">
    <el-form :model="addFrom" :rules="addFromRules" ref="addFormRef"
             label-width="70px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="addFrom.username"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="addFrom.password"></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="addFrom.email"></el-input>
      </el-form-item>
      <el-form-item label="电话" prop="mobile">
        <el-input v-model="addFrom.mobile"></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>

  import {checkEmail, checkMobile} from "../../../common/utils"

  export default {
    name: "DialogView",
    data() {
      return {
        //控制添加用户对话框的显示与隐藏
        //添加用户的表单数据
        addFrom: {
          username: "",
          password: "",
          email: "",
          mobile: ""
        },
        //添加表单的验证规则对象
        addFromRules: {
          username: [
            {required: true, message: "请输入用户名", trigger: "blur"},
            {min: 3, max: 10, message: "用户长度在3-10个字符之间", trigger: "blur"}
          ],
          password: [
            {required: true, message: "请输入密码", trigger: "blur"},
            {min: 6, max: 15, message: "用户长度在6-15个字符之间", trigger: "blur"}
          ],
          email: [
            {required: true, message: "请输入邮箱", trigger: "blur"},
            {validator: checkEmail, trigger: "blur"}
          ],
          mobile: [
            {required: true, message: "请输入手机号", trigger: "blur"},
            {validator: checkMobile, trigger: "blur"}
          ]
        },
      }
    },
    methods: {
      close() {
        this.$refs.addFormRef.resetFields();
      },
    }
  }
</script>

<style scoped>

</style>