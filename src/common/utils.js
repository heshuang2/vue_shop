//验证邮箱
export let checkEmail = (rule, value, callback) => {
  const regEmail = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/
  if (regEmail.test(value)) {
    return callback();
  }
  callback(new Error("请输入合法的邮箱"));
};
//验证手机号
export let checkMobile = (rule, value, callback) => {
  const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
  if (regMobile.test(value)) {
    return callback();
  }
  callback(new Error("请输入合法的手机号"));
};