import {request} from '@/utils/request'






// #导入文件
export function EvaluationFileImport(data) {
    return request.post("ai_evaluation/file/upload", data)
}

// 一键生成
export function OneclickUpdate(data) {
    return request.post("ai_evaluation/entity/server", data)
}

// 导入excel
export function EvaluationExcelImport(payload) {
    return request.post(
        "ai_evaluation/excel/import",
        payload,
        { headers: { "Content-Type": "application/json" } }
    );
}



// 分类树

// tree为查询操作
export function postDatasetTreeList(data) {
    return request.post("project_management/project/tree", data)
}
// 创建多个节点数
export function postDatasetTreeInfo(data) {
    return request.post("project_management/project/info", data)
}
// 删除节点树
export function deleteDatasetTreeInfo(projectId) {
    return request.delete("project_management/project/info",  {data:{project:projectId}})
}

//项目管理的叶子节点
//新增编辑数据集
export function postNode(data){
    return request.post("ai_evaluation/repository/info",data)
}
//删除数据集
export function deleteNode(datasetId){
    return request.delete("ai_evaluation/repository/info",{data:{dataset:datasetId}})
}


// 评测数据集明细
export function postDatasetItemList(data) {
    return request.post("ai_evaluation/dataset/list", data)
}

export function postDatasetItemInfo(data) {
    return request.post("ai_evaluation/dataset/info", data)
}

export function deleteDatasetItemInfo(params) {
    return request.delete("ai_evaluation/dataset/info", params)
}

//获得数据集
export function postDatasetList(data){
    return request.post("ai_evaluation/repository/list",data)
}
// 文件 
export function postFileUpdateList(data) {
    return request.post("ai_evaluation/file/list", data)
}

export function postFileUpdateInfo(data) {
    return request.post("ai_evaluation/file/info", data)
}

export function deleteFileUpdateInfo(params) {
    return request.delete("ai_evaluation/file/info", params)
}



// 数据集标签
export function postDatasetTagList(data) {
    return request.post("ai_evaluation/tag/list", data)
}

export function postDatasetTagInfo(data) {
    return request.post("ai_evaluation/tag/info", data)
}

export function deleteDatasetTagInfo(params) {
    return request.delete("ai_evaluation/tag/info", params)
}

// 评估对象 
export function postEvaluationObjectList(data) {
    return request.post("ai_evaluation/entity/list", data)
}

export function postEvaluationObjectInfo(data) {
    return request.post("ai_evaluation/entity/info", data)
}

// export function deleteEvaluationObjectInfo(params) {
//     return request.delete("ai_evaluation/evaluation/object/info", params)
// }

export function deleteEvaluationObjectInfo(id) {
    return request.delete("ai_evaluation/entity/info", { params: { id } })
  }



  // #获得评估记录分数
// export function generateEvaluationRecordResult(data) {
//     return request.post("ai_evaluation/dataset/evaluate_by_agents", data)
// }

// 评估记录结果
export function generateEvaluationRecordResult(data) {
    return request.post("ai_evaluation/record/server", data)
}

// 列表展示历史记录
export function postEvaluationHistoryList(data) {
    return request.post("ai_evaluation/record/list", data)
}

// 生成评估记录   
export function generateEvaluationRecord(data) {
    return request.post("ai_evaluation/history/list", data)
}

// 评估历史新增、修改方法
export function postEvaluationHistoryInfo(data) {
    return request.post("ai_evaluation/history/info", data)
}


export function deleteEvaluationHistoryInfo(params) {
    return request.delete("ai_evaluation/history/info", params)
}

//获得所有的叶子节点
export function getAllLeafNode(data) {
    return request.post("ai_evaluation/repository/list", data)
}

// 评估历史详情-已改
export function postEvaluationHistoryDetailList(data) {
    return request.post("ai_evaluation/history/list",data)
}

export function postEvaluationHistoryDetailInfo(data) {
    return request.post("ai_evaluation/record/info", data)
}

export function deleteEvaluationHistoryDetailInfo(params) {
    return request.delete("ai_evaluation/evaluation/history/detail/info", params)
}

//回显示节点文件名
export function postDatasetItemFileList (data) {
  /*  data 形如：{ dataset_id: 1 }  */
  return request.post('ai_evaluation/file/list', data)
}


//.zip文件下载
export function downloadDatasetFile (params) {
  return request.get(
    'ai_evaluation/file/download',
    { params, responseType: 'blob' }
  )
}


//详情数据编辑
export function postEvaluationHistoryDetailEdit(data) {
    return request.post("ai_evaluation/history/info", data)
}

//获取列表的数据集
export function postEvaluationDatasetList(data) {
    return request.get("ai_evaluation/dataset/names", data)
}
//获取列表的智能体
export function postEvaluationAgentList(data) {
    return request.get("ai_evaluation/agent/names", data)
}
//获取列表的评估对象
export function postEvaluationEntityList(data) {
    return request.get("ai_evaluation/entity/names", data)
}

//获取智能体的组别
export function postEvaluationAgentGroupList(data) {
    return request.get("ai_server/agent/brief_list", data)
}

//模板下载
export function downloadTemplate(params) {
    return request.get("ai_evaluation/excel/template/download", { params, responseType: 'blob' })
}