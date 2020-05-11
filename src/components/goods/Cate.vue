<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right" v-if="menuList.length !== 0">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>{{menuList[2].authName}}</el-breadcrumb-item>
      <el-breadcrumb-item>{{menuList[2].children[2].authName}}</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图-->
    <el-card>
      <!--添加分类按钮区域-->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!--表格-->
      <tree-table class="tree-table" :data="cateList" :columns="columns"
                  :selection-type="false" :expand-type="false"
                  show-index index-text="#" border >
        <template slot="isok" slot-scope="scope" >
          <i class="el-icon-success size" v-if="scope.row.cat_deleted === false"
             style="color: seagreen"></i>
          <i class="el-icon-error size" v-else style="color: red"></i>
        </template>
        <!--排序-->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!--操作-->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialogCate(scope.row.cat_id)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeDialogCate(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!--分页区域-->
      <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="querInfo.pagenum"
              :page-sizes="[3, 5, 10, 15]"
              :page-size="querInfo.pagesize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total">
      </el-pagination>
    </el-card>
    <!--添加分类对话框-->
    <el-dialog
            title="添加分类"
            :visible.sync="addCateDialogVisible"
            width="50%" @close="addCateDialogClose"
            >
      <el-form ref="addCateFormRef" :rules="addCateFormRules"
               :model="addCateForm" label-width="100px">
      <el-form-item label="分类名称" prop="cat_name">
        <el-input v-model="addCateForm.cat_name"></el-input>
      </el-form-item>
        <el-form-item label="父级分类" >
            <el-cascader
                    v-model="selectedKeys"
                    :options="parentCateList"
                    :props="{value: 'cat_id',
                             label: 'cat_name',
                             children: 'children',
                             expandTrigger:'hover',
                             checkStrictly: 'true'}"
                    @change="parentCateChange"
                    clearable ></el-cascader>
        </el-form-item>
      </el-form>
    <el-button @click="addCateDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addCate">确 定</el-button>
    </el-dialog>
    <!--编辑分类名称对话框-->
    <el-dialog
            title="提示"
            :visible.sync="EditDialogVisible"
            width="50%"
            >
      <el-form ref="editDialogFormRef" :model="editFormName" :rules="editDialogFromRules"
               label-width="80px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editFormName.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="EditDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="EditDialogInfo">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "Cate",
    data() {
      return {
        //商品分类数据列表
        cateList: [],
        //查询条件
        querInfo: {
          type: 3,
          pagenum: 1,
          pagesize: 5
        },
        //总数据条数
        total: 0,
        //为table指定列的定义
        columns: [
          {
            label: "分类名称",
            prop: "cat_name",
           },
          {
            label: "是否有效",
            //将当前列定义为模板列
            type: "template",
            // 表示当前这一列使用模板名称
            template: "isok",
            align: "center",
            headerAlign: "center"
          },
          {
            label: "排序",
            //将当前列定义为模板列
            type: "template",
            // 表示当前这一列使用模板名称
            template: "order",
            align: "center",
            headerAlign: "center"
          },
          {
            label: "操作",
            //将当前列定义为模板列
            type: "template",
            // 表示当前这一列使用模板名称
            template: "opt",
            align: "center",
            headerAlign: "center"
          },
          ],
        //控制添加分类对话框的显示与隐藏
        addCateDialogVisible: false,
        //添加分类的表单数据
        addCateForm: {
          //将要添加的分类名称
          cat_name: "",
          //父级分类的ID
          cat_pid: 0,
          //分类的等级，默认要添加的是一级分类
          cat_level: 0
        },
        //添加分类表单的验证规则对象
        addCateFormRules: {
          cat_name: [
            {required: true, message: "请输入分类名称", trigger: "blur"},
          ]
        },
        //父级分类的列表
        parentCateList: [],
        //指定级联选择器的配置对象

        //选中的父级分类的id数组
        selectedKeys: [],
        //控制添加编辑对话框的显示与隐藏
        EditDialogVisible: false,
        //查询到的用户信息保存
        editFormName: {},
        //编辑分类表单的验证规则对象
        editDialogFromRules: {
          cat_name: [
            {required: true, message: "请输入分类名称", trigger: "blur"},
          ]
        }
      }
    },
    computed: {
      menuList() {
        return this.$store.state.menuList;
      }
    },
    created() {
      this.getCategoriesList();
    },
    methods: {
      //获取商品分类数据
      async getCategoriesList() {
        const {data: res} = await this.$http.get('categories', { params: this.querInfo});
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
        this.cateList = res.data.result;
        this.total = res.data.total;
        // console.log(res);
      },
      //监听pagesize改变的事件
      handleSizeChange(newSize) {
        this.querInfo.pagesize = newSize;
        this.getCategoriesList()
      },
      //监听pagenum的改变
      handleCurrentChange(newPage) {
        this.querInfo.pagenum = newPage;
        this.getCategoriesList();
      },
      showAddCateDialog() {
        //先获取父级分类的数据列表，在展示对话框
        this.getParentCateList();
        this.addCateDialogVisible = true;
      },
      //获取父级分类的数据列表
      async getParentCateList() {
        const {data: res} = await this.$http.get("categories", {params: {type: 2}});
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg);
        }
        this.parentCateList = res.data;
      },
      //选择项发生变化触发这个函数
      parentCateChange() {
        console.log(this.selectedKeys);
        //如果selected的length大于0，说明选中了分类
        if (this.selectedKeys.length > 0) {
          //父级分类的ID
          this.addCateForm.cat_pid
              = this.selectedKeys[this.selectedKeys.length - 1];
          //为当前分类等级赋值
          this.addCateForm.cat_level = this.selectedKeys.length;
        }else {
          //父级分类的ID
          this.addCateForm.cat_pid
              = 0;
          //为当前分类等级赋值
          this.addCateForm.cat_level = 0;
        }
      },
      //点击按钮，添加分类
      addCate() {
        this.$refs.addCateFormRef.validate(async valid => {
          if (!valid) return;
          const {data: res}
          = await this.$http.post("categories", this.addCateForm);
          console.log(res);
          if (res.meta.status !== 201) {
            return this.$message.error(res.meta.msg);
          }
          this.$message.success(res.meta.msg);
          this.getCategoriesList();
          this.addCateDialogVisible = false;
        });
      },
      //监听对话框的关闭事件，重置表单数据
      addCateDialogClose() {
        this.$refs.addCateFormRef.resetFields();
        this.selectedKeys = [];
        this.addCateForm.cat_level = 0;
        this.addCateForm.cat_pid = 0;
      },
      //编辑分类名称
      async showEditDialogCate(id) {
        const {data: res} = await this.$http.get("categories/"+ id);
        console.log(res);
        if (res.meta.status !== 200) {
          this.$message.error(res.meta.msg);
        }
        this.editFormName = res.data;
        this.EditDialogVisible = true;
      },
      //提交编辑分类名称
      EditDialogInfo() {
        this.$refs.editDialogFormRef.validate(async valid => {
          if (!valid) return;
          const {data: res} = await this.$http.put
          ("categories/" + this.editFormName.cat_id, {
            cat_name: this.editFormName.cat_name
          });
          if (res.meta.status !== 200) {
            this.$message.error(res.meta.msg);
          }
          this.EditDialogVisible = false;
          this.$message.success("修改成功");
          this.getCategoriesList();
        })
      },
      async removeDialogCate(id) {
        const confirmResult = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
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
        const {data: res} = await this.$http.delete('categories/' + id);
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg);
        }
        this.$message.success(res.meta.msg);
        this.getCategoriesList();
      }
    }
  }
</script>

<style  lang="less" scoped>
  .tree-table {
    margin: 20px 0;
    font-size: 12px;
  }
  .size {
    font-size: large;
  }
  .el-cascader {
    width: 100%;
  }
</style>