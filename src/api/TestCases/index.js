import {request} from '@/utils/request'

//菜单巡查
export function MenuInspectionTaskList(data) {
    return  request({
        method: 'POST',
        url: '/menu_inspection/task/list',
        data,
    })
}

export function MenuInspectionTaskInfoPost(data) {
    return  request({
        method: 'POST',
        url: '/menu_inspection/task/info',
        data,
    })
}

export function MenuInspectionTaskInfoDelete(params) {
    return  request({
        method: 'DELETE',
        url: '/menu_inspection/task/info',
        params,
    })
}

export function MenuInspectionRecordList(data) {
    return  request({
        method: 'POST',
        url: '/menu_inspection/record/list',
        data,
    })
}

export function MenuInspectionRecordInfoDelete(params) {
    return  request({
        method: 'DELETE',
        url: '/menu_inspection/record/info',
        params,
    })
}

export function MenuInspectionServer(data) {
    return  request({
        method: 'POST',
        url: '/menu_inspection/server',
        data,
    })
}
export function MenuInspectionServerTimingOn(data) {
    return  request({
        method: 'POST',
        url: '/menu_inspection/server/timing/on',
        data,
    })
}

export function MenuInspectionServerTimingOff(data) {
    return  request({
        method: 'POST',
        url: '/menu_inspection/server/timing/off',
        data,
    })
}

export function MenuInspectionServerPushOn(data) {
    return  request({
        method: 'POST',
        url: '/menu_inspection/server/push/on',
        data,
    })
}

export function MenuInspectionServerPushOff(data) {
    return  request({
        method: 'POST',
        url: '/menu_inspection/server/push/off',
        data,
    })
}

export function MenuInspectionServerPush(data) {
    return  request({
        method: 'POST',
        url: '/menu_inspection/server/push',
        data,
    })
}

export function PushEnvironmentWebSelect(data) {
    return  request({
        method: 'GET',
        url: '/push_environment/webhook/select',
        data,
    })
}

export function MenuInspectionSchedulerTaskList(data) {
    return  request({
        method: 'POST',
        url: '/menu_inspection/scheduler/task/list',
        data,
    })
}
//demandmanagement
//获得的列表数据
export function postListData(data){
    return request.post("test_flow/requirement/list",data)
}
export function postAllAgent(data){
    return request.post("ai_server/agent/list",data)
}

export function postTestCase(data){
    return request.post("test_flow/requirement/server",data)
}

//删除需求表
export function postDeleteRequirement(id) {
  return request.delete("/test_flow/requirement/info", {
    params: { id }
  })
}
//提交需求表
export function postSubmitRequirement(data) {
  return request.post("test_flow/requirement/info", data)
}


//testgeneration
//获得记录表
export function postTestGenerationList(data) {
  return request.post("test_flow/caserecord/list", data)
}
//删除记录表
export function postDeleteTestGeneration(id) {
  return request.delete("/test_flow/caserecord/info", {
    params: { id }
  })
}
//提交测试用例
export function postSubmitTestCase(params){
    return request.post("test_flow/testcase/server",params)
}


//测试用例记录表
export function postTestCaseRecordList(data) {
  return request.post("test_flow/testcase/list", data)
}