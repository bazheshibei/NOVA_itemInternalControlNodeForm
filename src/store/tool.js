
// import { Message } from 'element-ui'

const Tool = {}

/**
 * [返回：datalist]
 * @param {[Array]}  list     项目列表
 * @param {[Array]}  nodeList 节点列表
 * @param {[Object]} state
 */
Tool.returnDatalist = function (list = [], nodeList = [], state) {
  const that = this
  const idArr = []
  const datalist = []
  const nodeObj = {}
  const errorObj = {}
  /* 提取：节点名称 */
  nodeList.forEach(function (item) {
    nodeObj[item.node_id] = item.node_name
  })
  /* 提取：节点 */
  list.forEach(function (item, index) {
    idArr.push(item.item_id)
    /* 提取：基础字段 */
    const { type: gantt_type } = JSON.parse(localStorage.getItem('sumittcpcGanttSummaryType') || '{}')
    const { jzz_data, nodeTemplateMapList, item_name, node_template_id, node_template_detail_id, item_id, item_gantt_id, p_item_gantt_id, plant_order_id: plant_id, material_id, color_id } = item
    const obj = { node_template_id, item_id, item_gantt_id, nodedatalist: [], p_item_gantt_id, plant_id, material_id, color_id, audit_status: 5, gantt_type, gantt_node_type: 2 }
    /* 提取：公式 */
    const startEndDateMap = JSON.parse(jzz_data || '{}')
    for (const x in item) {
      const node = item[x]
      if (node instanceof Object && (node.node_id || node.node_code)) {
        startEndDateMap['${' + node.node_code + '}'] = node.first_plant_enddate
      }
    }
    /* 处理节点 */
    nodeTemplateMapList.forEach(function (val) {
      const node = item[val.node_id]
      const { first_plant_enddate, node_id } = node
      if (!first_plant_enddate) {
        /* 报错：空值（_toggleTime 方法会将'/'之外的非时间格式转为当年一月一号） */
        if (!errorObj[item_name]) {
          errorObj[item_name] = []
        }
        errorObj[item_name].push(nodeObj[node_id])
      } else {
        /* 计算：最大最小值 */
        const { business_post_id: item_team_id, first_plant_enddate, node_id, max_section_value, min_section_value } = node
        const max_plant_enddate = first_plant_enddate === '/' ? '/' : that._returnTime(max_section_value, startEndDateMap)
        const min_plant_enddate = first_plant_enddate === '/' ? '/' : that._returnTime(min_section_value, startEndDateMap)
        /* 验证通过：添加节点数据 */
        obj.nodedatalist.push({ node_id, node_template_detail_id, first_plant_enddate, min_plant_enddate, max_plant_enddate, item_team_id })
      }
    })
    datalist.push(obj)
  })
  return { datalist: JSON.stringify(datalist), itemids: idArr.join(','), errorObj }
}

/** --------------------------- 工具方法 --------------------------- **/

/**
 * [公式 转 时间]
 * @param {[String]} str         公式
 * @param {[Object]} nodeCodeObj 当前项目的节点值 { ${变量}: 自身时间 }
 */
Tool._returnTime = function (str = '', nodeCodeObj = {}) {
  const asd = str.replace(/\$\{[\w-_:/]+\}/g, function (name) {
    return nodeCodeObj[name] ? new Date(nodeCodeObj[name]).getTime() : 0
  })
  const numStr = asd.replace(/[0-9]+/g, function (num, index) {
    if (num.length < 13) {
      let isChange = true
      let beforeStr = ''
      let afterStr = ''
      let numStr = 0
      if (index !== 0) {
        beforeStr = asd[index - 1]
      }
      if (index + num.length !== asd.length) {
        afterStr = asd[index + num.length]
      }
      if (beforeStr === '*' || beforeStr === '/' || afterStr === '*' || afterStr === '/') {
        isChange = false
      }
      numStr = num
      if (isChange) {
        numStr = parseInt(numStr) * 60 * 60 * 24 * 1000
      }
      return `${numStr}`
    } else {
      return num
    }
  })
  /* 毫秒数 转 时间 */
  // eslint-disable-next-line
  const timeStr = eval(numStr)
  if (isNaN(timeStr)) {
    return ''
  } else if (new Date(timeStr).getTime() < new Date('2000-01-01').getTime()) {
    return ''
  } else {
    const d = new Date(timeStr)
    const year = d.getFullYear()
    const month = d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1
    const day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate()
    return `${year}-${month}-${day}`
  }
}
/**
 * [转换：处理时间格式]
 * @param {[String]} time 时间
 */
Tool._toggleTime = function (time) {
  if (time === '/') {
    return time
  } if (time) {
    const [three, two, one] = time.split(/[-//.]/g).reverse()
    /* 处理：年 */
    let year = parseInt(new Date().getFullYear()) // 年 {[Int]}
    if (!isNaN(parseInt(one))) {
      const str = String(one).trim()
      year = parseInt(String(year).slice(0, -1 * str.length) + str)
    }
    /* 处理：月 */
    let addYear = 0 // 增加的年份 {[Int]}
    let month = (isNaN(parseInt(two)) || two === '0') ? 1 : parseInt(two) // 月 {[Int]}
    for (let i = 0; ; i++) {
      if (month > 12) {
        addYear++
        month -= 12
      } else {
        break
      }
    }
    year = year + addYear
    /* 处理：日 */
    let year_2 = month < 12 ? year : year + 1
    let month_2 = month < 12 ? month + 1 : month + 1 - 12
    let day = (isNaN(parseInt(three)) || three === '0') ? 1 : parseInt(three) // 日 {[Int]}
    for (let i = 0; ; i++) {
      const maxDay = new Date(new Date(`${year_2}-${month_2}`).getTime() - 1000 * 60 * 60 * 24).getDate()
      if (day > maxDay) {
        day -= maxDay
        month++
        month_2++
        if (month > 12) {
          month -= 12
          year += 1
          year_2 += 1
        }
        if (month_2 > 12) {
          month_2 -= 12
        }
      } else {
        break
      }
    }
    /* 整合 */
    return `${year}-${'00'.slice(0, -1 * String(month).length) + month}-${'00'.slice(0, -1 * String(day).length) + day}`
  } else {
    return ''
  }
}
/**
 * [验证：计划事件是否在区间内]
 * @param {[String]} maxVal       最大值
 * @param {[String]} minVal       最小值
 * @param {[String]} plantVal     计划时间
 * @param {[String]} order_time   下单日期
 * @param {[String]} deliver_date 客人交期
 */
Tool._isError = function (maxVal = '', minVal = '', plantVal = '', order_time = '', deliver_date = '') {
  const max = isNaN(new Date(maxVal).getTime()) ? 0 : new Date(maxVal).getTime() //       最大值
  const min = isNaN(new Date(minVal).getTime()) ? 0 : new Date(minVal).getTime() //       最小值
  const plant = isNaN(new Date(plantVal).getTime()) ? 0 : new Date(plantVal).getTime() // 计划时间
  const order = new Date(order_time).getTime() //                                         下单日期
  const deliver = new Date(deliver_date).getTime() //                                     客人交期
  const countMax = max || deliver
  const countMin = min || order
  const time_1 = this._returnYearMonthDay(countMin)
  const time_2 = this._returnYearMonthDay(countMax)
  const maxMinText = `最早：${time_1 === '1970-01-01' ? '未知' : time_1}，最晚：${time_2 === '1970-01-01' ? '未知' : time_2}` // 提示文字
  /* 返回 */
  if (countMin && countMax && (countMin <= plant && plant <= countMax)) {
    return { status: false, maxMinText }
  } else {
    return { status: true, maxMinText }
  }
}
/**
 * [提取：年月日]
 */
Tool._returnYearMonthDay = function (strOrNum) {
  const d = new Date(strOrNum)
  const year = d.getFullYear()
  const month = d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1
  const day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate()
  return `${year}-${month}-${day}`
}

export default Tool
