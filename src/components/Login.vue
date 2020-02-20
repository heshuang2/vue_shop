<template>
  <div class="login_container">
    <div class="login_box">
      <!--头像区-->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="">
      </div>
      <!--登录区-->
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules"
               label-width="0" class="login_form">
        <!--登录-->
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user" />
        </el-form-item>
        <!--密码-->
        <el-form-item prop="password">
          <el-input type="password" v-model="loginForm.password"
                    prefix-icon="iconfont icon-3702mima" />
        </el-form-item>
        <!--按钮-->
        <el-form-item class="btn">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  export default {
    name: "Login",
    data() {
      return {
        //登录表单数据对象
        loginForm: {
          username: "admin",
          password: "123456"
        },
        //表单验证规则对象
        loginFormRules: {
          username: [
            {required: true, message: "请输入用户名", trigger: "blur"},
            {min: 3, max: 10, message: "用户名长度为3到10个字符", trigger: "blur"}
          ],
          password: [
            {required: true, message: "请输入密码", trigger: "blur"},
            {min: 6, max: 15, message: "用户名长度为6到15个字符", trigger: "blur"}
          ]
        }
      }
    },
    methods: {
      //重置表单
      resetLoginForm() {
        // console.log(this);
        this.$refs.loginFormRef.resetFields();
      },
      //表单登录验证
      login() {
        /*返回值为Promise 可以使用async和await简化promise操作
        * await关键字只能放在async函数中*/
        this.$refs.loginFormRef.validate(async valid => {
          // console.log(valid);
          if (!valid) return;
          //解构
          const {data: res} = await this.$http.post("login", this.loginForm);
          console.log(res);
          if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
          this.$message.success(res.meta.msg);
          //1.登录成功将token保存在客户端的sessionStorage中
          //项目中除了登录之外的其他API接口，必须在登陆之后才能访问
          //token只应该在当前网页打开期间生效，所以将token保存在sessionStorage中
          window.sessionStorage.setItem("token", res.data.token);
          //跳转路由 /home
          await this.$router.push("/home");
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .login_container {
    background-color: #2b4b6b;
    height: 100%;
  }
  .login_box {
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  .avatar_box {
    height: 120px;
    width: 120px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
  .login_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
  }
  .btn {
    display: flex;
    justify-content: center;
  }
</style>