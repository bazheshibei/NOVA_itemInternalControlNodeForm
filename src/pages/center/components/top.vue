
<!-- 模块：下拉框 -->
<template>
  <div class="comBox">

    <div class="formLine">
      <!-- 业务类型 -->
      <div class="formTextBox" style="flex: 0;">
        <div class="formText">
          <span>业务类型：</span>大货内控节点计划&nbsp;&nbsp;
        </div>
      </div>
      <!-- 本次提报项目 -->
      <div class="formTextBox">
        <div class="formText">
          <span>本次提报项目：</span>
          <el-input class="comInput" size="mini" :value="itenames" disabled slot="reference">
            <el-button slot="append" class="comInputBtnRight" size="mini" @click="chooseProject">选择项目</el-button>
          </el-input>
          <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>
          <el-button type="primary" size="mini" @click="createdTable">创建</el-button>
          <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>
          <div class="">
            <p>面料相关节点、服装厂相关节点提报总计划，分线计划请前往面料内空节点列表和工厂内控节点进行调整。</p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
export default {
  data() {
    return {}
  },
  created() {},
  computed: {
    ...mapState(['projectList', 'itemids']),
    ...mapGetters(['itenames'])
  },
  methods: {
    /**
     * [选择项目]
     */
    chooseProject() {
      const that = this
      /* 添加数据 */
      const { itemids } = that
      const host = window.location.origin + '/nova/'
      // eslint-disable-next-line
      win({
        url: host + `pages/itemganttsummary/choiceItemInfolistGoods.jsp?itemids=${itemids}`,
        param: {},
        width: 1100,
        height: 550,
        title: '选择项目',
        onClose: function () {}
      })
    },
    /**
     * [创建表格]
     */
    createdTable() {
      /** 请求：页面初始化数据 **/
      this.$store.dispatch('A_getItemNodeTemple', { status: '创建' })
    }
  }
}
</script>

<style scoped>
.comBox {
  display: flex;
  flex-wrap: wrap;
  flex: 1;
}

.otherText {
  min-width: 200px;
  white-space: pre-wrap;
}
.comSelectOptions { /* 下拉框：选项 */
  margin-top: -3px;
}
.otherModelBox { /* 其他模板 */
  display: flex;
  align-items: center;
}
</style>

<style>
.comInput {
  max-width: 200px !important;
}
</style>
