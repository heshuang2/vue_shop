<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right" v-if="menuList.length !== 0">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>{{menuList[2].authName}}</el-breadcrumb-item>
      <el-breadcrumb-item>{{menuList[2].children[1].authName}}</el-breadcrumb-item>
    </el-breadcrumb>
    <!--头部警告区域-->
   <el-card>
     <el-alert
             title="注意:只允许为第三级分类设置相关参数！"
             type="warning" :closable="false" show-icon >
     </el-alert>
     <!--选择商品分类区域-->
     <el-row class="cat_opt">
       <el-col>
         <span class="box">选择商品分类:</span>
         <!--选择商品分类的级联选择框-->
         <el-cascader
                 v-model="selectCateKeys"
                 :options="cateList"
                 :props="{ expandTrigger: 'hover',
                value: 'cat_id',label: 'cat_name',
                children: 'children'}"
                 @change="handleChange"
                 placeholder="请输入要搜索的关键词"
                 clearable filterable size="medium ">
         </el-cascader>
       </el-col>
     </el-row>
     <!--tab 页签区域-->
     <el-tabs v-model="activeName" @tab-click="handleTabClick">
       <el-tab-pane label="动态参数" name="many">
         <el-button type="primary" size="mini" :disabled="isBtnDisabled"
                    @click="addDialogVisible = true">添加参数</el-button>
         <!--动态参数表格-->
         <el-table :data="manyTableData"  stripe>
           <!--展开行-->
           <el-table-column type="expand">
             <template slot-scope="scope">
               <el-tag v-for="(item, index) in scope.row.attr_vals"
                       :key="index" closable  @close="handleClose(scope.row ,item)">{{item}}</el-tag>
               <!--输入文本框-->
               <el-input
                       class="input-new-tag"
                       v-if="scope.row.inputVisible"
                       v-model="scope.row.inputValue"
                       ref="saveTagInput"
                       size="small"
                       @keyup.enter.native="handleInputConfirm(scope.row)"
                       @blur="handleInputConfirm(scope.row)"
               >
               </el-input>
               <!--添加的按钮-->
               <el-button v-else class="button-new-tag"
                          size="small" @click="showInput(scope.row)">+ New Tag</el-button>
             </template>
           </el-table-column>
           <!--索引列-->
           <el-table-column type="index"></el-table-column>
           <el-table-column label="参数名称" prop="attr_name" align="center"></el-table-column>
           <el-table-column label="操作" >>
             <template slot-scope="scope">
               <el-button type="primary"  size="mini" icon="el-icon-edit"
                          @click="EditDialogParams(scope.row.attr_id)">编辑</el-button>
               <el-button type="danger"  size="mini" icon="el-icon-delete"
                          @click="removeDialogParams(scope.row.attr_id)">删除</el-button>
             </template>
           </el-table-column>
         </el-table>
       </el-tab-pane>
       <el-tab-pane label="静态属性" name="only">
         <el-button type="primary" size="mini" :disabled="isBtnDisabled"
                    @click="addDialogVisible = true">添加属性</el-button>
         <!--静态参数表格-->
         <el-table :data="onlyTableData"  stripe>
           <!--展开行-->
           <el-table-column type="expand">
             <template slot-scope="scope">
               <!--循环渲染标签-->
               <el-tag v-for="(item, index) in scope.row.attr_vals"
                       :key="index" closable @close="handleClose(scope.row ,item)">{{item}}</el-tag>
               <!--输入文本框-->
               <el-input
                       class="input-new-tag"
                       v-if="scope.row.inputVisible"
                       v-model="scope.row.inputValue"
                       ref="saveTagInput"
                       size="small"
                       @keyup.enter.native="handleInputConfirm(scope.row)"
                       @blur="handleInputConfirm(scope.row)"
               >
               </el-input>
               <!--添加的按钮-->
               <el-button v-else cqlass="button-new-tag"
                          size="small" @click="showInput(scope.row)">+ New Tag</el-button>
             </template>
           </el-table-column>
           <!--索引列-->
           <el-table-column type="index"></el-table-column>
           <el-table-column label="参数名称" prop="attr_name" align="center"></el-table-column>
           <el-table-column label="操作" >>
             <template slot-scope="scope">
               <el-button type="primary"  size="mini" icon="el-icon-edit"
                          @click="EditDialogParams(scope.row.attr_id)">编辑</el-button>
               <el-button type="danger"  size="mini" icon="el-icon-delete"
                          @click="removeDialogParams(scope.row.attr_id)">删除</el-button>
             </template>
           </el-table-column>
         </el-table>
       </el-tab-pane>
     </el-tabs>
   </el-card>
    <!--添加参数对话框-->
    <el-dialog
            :title="'添加' + titleText"
            :visible.sync="addDialogVisible"
            width="50%" @close="addDialogClose">
      <el-form :model="addFormParams" ref="addFormRef"
               :rules="addFormRules" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addFormParams.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!--修改参数对话框-->
    <el-dialog
            title="修改参数"
            :visible.sync="editDialogVisible"
            width="50%" >
      <el-form :model="editFormParams" ref="editFormRef"
               :rules="addFormRules" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editFormParams.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "Params",
    data() {
      return {
        //商品分类列表
        cateList: [],
        //级联选择框双向绑定到的数组
        selectCateKeys: [],
        //被激活的页签的名称
        activeName: 'many',
        //动态参数
        manyTableData: [],
        //静态参数
        onlyTableData: [],
        //控制添加对话框的显示与隐藏
        addDialogVisible: false,
        //添加参数的表单数据对象
        addFormParams: {
          attr_name: ''
        },
        //添加分类表单的验证规则对象
        addFormRules: {
          attr_name: [
            {required: true, message: "请输入参数名称", trigger: "blur"},
          ]
        },
        //控制修改对话框的显示与隐藏
        editDialogVisible: false,
        //查询到的用户信息保存
        editFormParams: {},
      }
    },
    computed: {
      menuList() {
        return this.$store.state.menuList;
      },
      //控制按钮启用禁用
      isBtnDisabled() {
        if (this.selectCateKeys.length !== 3) return true;
        return false;
      },
      //当前选中的三级分类的ID
      cateId() {
        if (this.selectCateKeys.length === 3)
          return this.selectCateKeys[2];
        return null;
      },
      //动态计算标题的文本
      titleText() {
        if (this.activeName === "many") return '动态参数';
        return '静态属性';
      }
    },
    created() {
      this.getCateList();
    },
    methods: {
      async getCateList() {
        const {data: res}  = await this.$http.get("categories");
        // console.log(res);
        if (res.meta.status !== 200)
          return this.$message.error(res.meta.msg);
        this.cateList = res.data;
      },
      //选择项发生变化触发这个函数
      handleChange() {
        this.getParamsData();
      },
      //tab页签点击事件的处理函数
      handleTabClick() {
        console.log(this.activeName);
        this.getParamsData()
      },
      //获取参数的列表数据
      async getParamsData() {
        //证明选中的不是三级分类
        if (this.selectCateKeys.length !== 3) {
          this.selectCateKeys = [];
          this.manyTableData = [];
          this.onlyTableData = [];
          return;
        }
        //根据所选分类的ID和当前所处面板获取参数
        const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`,
            {params: { sel: this.activeName}});
        // console.log(res);
        if (res.meta.status !== 200)
          return this.$message.error("请选择商品分类");
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(`,`): [];
          //添加控制文本框的显示与隐藏
          item.inputVisible = false;
          //文本框输入内容
          item.inputValue = '';
        });
        console.log(res);
        if (this.activeName === 'many') {
          this.manyTableData = res.data;
          console.log(this.manyTableData);
        }else {
          this.onlyTableData = res.data;
          console.log(this.onlyTableData);
        }
      },
      //监听对话框的关闭事件，重置表单数据
      addDialogClose() {
        this.$refs.addFormRef.resetFields();
      },
      //提交参数
      addParams() {
        this.$refs.addFormRef.validate(async valid => {
          console.log(valid);
          if (!valid) return;
          const {data: res} = await this.$http.post
          (`categories/${this.cateId}/attributes`, {
            attr_name: this.addFormParams.attr_name,
            attr_sel: this.activeName,
          });
          if (res.meta.status !== 201) {
            this.$message.error(res.meta.msg);
          }
          this.addDialogVisible = false;
          this.$message.success("添加参数成功");
          this.getParamsData();
        })
      },
      //编辑参数名称
      async EditDialogParams(id) {
        const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes/${id}`, {
          params: { attr_set: this.activeName}
        });
        if (res.meta.status !== 200) {
          this.$message.error(res.meta.msg);
        }
        this.editFormParams = res.data;
        this.editDialogVisible = true;
      },
      //提交编辑参数
      editParams() {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return;
          const {data: res} = await this.$http.put
          (`categories/${this.cateId}/attributes/${this.editFormParams.attr_id}`, {
            attr_name: this.editFormParams.attr_name,
            attr_sel: this.editFormParams.attr_sel,
          });
          if (res.meta.status !== 200) {
            this.$message.error(res.meta.msg);
          }
          this.editDialogVisible = false;
          this.$message.success("修改成功");
          this.getParamsData();
        })
      },
      //删除参数
      async removeDialogParams(id) {
        const confirmResult = await this.$confirm('此操作将永久删除该属性, 是否继续?', '提示', {
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
        const {data: res} = await this.$http.delete
        (`categories/${this.cateId}/attributes/${id}`);
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg);
        }
        this.$message.success(res.meta.msg);
        this.getParamsData();
      },
      //文本框失去焦点或按下Enter按键触发
      handleInputConfirm(row) {
        if (row.inputValue.trim().length === 0){
          row.inputValue = '';
          row.inputVisible = false;
          return;
        }
        row.attr_vals.push(row.inputValue.trim());
        row.inputValue = '';
        row.inputVisible = false;
        this.saveAttrValues(row);
      },
      //点击按钮，展示文本输入框
      showInput(row) {
        row.inputVisible = true;
        //让文本框自动获得焦点
        //$nextTick当页面上的元素被重新渲染之后，才会执行回调函数中的代码
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
      },
      //将tag标签上传到数据库
      async saveAttrValues(row) {
        const {data: res} = await this.$http.put
        (`categories/${this.cateId}/attributes/${row.attr_id}`, {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(',')
        });
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg);
        }
        this.$message.success('修改成功');
      },
      //关闭tag标签
      handleClose(row, tag) {
        row.attr_vals.splice(row.attr_vals.indexOf(tag), 1);
        this.saveAttrValues(row);
      }
    }
  }
</script>

<style lang="less" scoped>
 .cat_opt {
   margin: 15px 0
 }
 .box {
   display: block;
   float: left;
   border-radius: 5px;
   border: 1px solid #ccc;
   height: 34px;
   width: 120px;
   text-align: center;
   line-height: 36px;
   font-family: "Microsoft YaHei", "微软雅黑";
   font-weight: 500;
   margin-right: 2px;
   background-color: #F5F7FA;
 }
  .el-tag {
    margin: 10px;
  }
  .input-new-tag {
    width: 150px;
  }
</style>