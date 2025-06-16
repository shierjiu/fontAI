import {request} from '@/utils/request'





    // FAQ基础信息不包含文P

export function PostKnowledgeBaseFaqQaInfoList(data) {
    return  request({
        method: 'POST',
        url: '/knowledge_base/kb/faq/qa/list',
        data,
    })
}

export function GetKnowledgeBaseFaqQaInfoSelect(data) {
    return  request({
        method: 'GET',
        url: '/knowledge_base/kb/faq/qa/select',
        data,
    })
}

export function PostKnowledgeBaseFaqQaInfo(data) {
    return  request({
        method: 'POST',
        url: '/knowledge_base/kb/faq/qa/info',
        data,
    })
}

export function DeleteKnowledgeBaseFaqQaInfo(params) {
    return  request({
        method: 'DELETE',
        url: '/knowledge_base/kb/faq/qa/info',
        params,
    })
}





// FAQ基础信息包含文件
export function PostKnowledgeBaseFaqInfoList(data) {
    return  request({
        method: 'POST',
        url: '/knowledge_base/kb/faq/list',
        data,
    })
}


export function GetKnowledgeBaseFaqInfoSelect(data) {
    return  request({
        method: 'GET',
        url: '/knowledge_base/kb/faq/select',
        data,
    })
}



export function PostKnowledgeBaseFaqInfo(data) {
    return  request({
        method: 'POST',
        url: '/knowledge_base/kb/faq/info',
        data,
    })
}


export function DeleteKnowledgeBaseFaqInfo(params) {
    return  request({
        method: 'DELETE',
        url: '/knowledge_base/kb/faq/info',
        params,
    })
}





// FAQ组
export function PostKnowledgeBaseFaqGroupInfoList(params) {
    return  request({
        method: 'POST',  // 恢复原始请求方法
        url: '/knowledge_base/kb/faq/group/list',  // 恢复原始URL路径
        data: params,    // POST请求使用data参数
    })
}


export function GetKnowledgeBaseFaqGroupInfoSelect(data) {
    return  request({
        method: 'GET',
    url: '/knowledge_base/kb/faq/group/select',
        data,
    })
}


export function PostKnowledgeBaseFaqGroupInfo(data) {
    return  request({
        method: 'POST',
        url: '/knowledge_base/kb/faq/group/info',
        data,
    })
}


export function DeleteKnowledgeBaseFaqGroupInfo(params) {
    return request({
        method: 'DELETE',
        url: '/knowledge_base/kb/faq/group/info',
        params,  // 确保使用params传递DELETE请求参数
    })
}



//FAQ上传文件--已改
// Original list function (used by KnowledgeBaseFaqManage.vue)
export function PostKnowledgeBaseFaqFileUploadIList(data) {
  return request({
    method: 'POST',
    url: '/knowledge_base/kb/faq/fileupload/list',
    data,
  })
}

// New info list function (used by KnowledgeBaseFilesUpload.vue)
export function PostKnowledgeBaseFaqFileUploadInfoList(data) {
  return request({
    method: 'POST',
    url: '/knowledge_base/kb/faq/fileupload/list',
    data
  })
}

export function GetKnowledgeBaseFaqFileUploadInfoSelect(data) {
    return  request({
        method: 'GET',
    url: '/knowledge_base/kb/faq/fileupload/select',
        data,
    })
}



export function PostKnowledgeBaseFaqFileUploadInfoPost(data) {
    return  request({
        method: 'POST',
        url: '/knowledge_base/kb/faq/fileupload/info',
        data,
    })
}

export function PostKnowledgeBaseFaqFileUploadInfo(data) {
    const id = data.get('id');
    return request({
        method: 'post',
        url: `/knowledge_base/kb/faq/fileupload/info?id=${id}`,
        data,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}


export function DeleteKnowledgeBaseFaqFileUploadInfo(params) {
  return request({
    url: '/knowledge_base/kb/faq/fileupload/info',
    method: 'delete',
    params,
  })
}



// 测试环境 
export function PostKnowledgeBaseTestEnvInfoList(data) {
    return  request({
        method: 'POST',
        url: '/knowledge_base/kb/testenv/list',
        data,
    })
}


// export function GetKnowledgeBaseTestEnvInfoSelect(data) {
//     return  request({
//         method: 'GET',
//         url: '/knowledge_base/kb/testenv/select',
//         data,
//     })
// }


export function PostKnowledgeBaseTestEnvInfo(data) {
    return  request({
        method: 'POST',
        url: '/knowledge_base/kb/testenv/info',
        data,
    })
}


export function DeleteKnowledgeBaseTestEnvInfo(params) {
    return  request({
        method: 'DELETE',
        url: '/knowledge_base/kb/testenv/info',
        params,
    })
}


// #加密狗环境

export function PostKnowledgeBaseTestEnvAuthDogInfoList(data) {
    return  request({
        method: 'POST',
        url: '/knowledge_base/kb/testenv/authDog/list',
        data,
    })
}




export function PostKnowledgeBaseTestEnvAuthDogInfo(data) {
    return  request({
        method: 'POST',
        url: '/knowledge_base/kb/testenv/authDog/info',
        data,
    })
}


export function DeleteKnowledgeBaseTestEnvAuthDogInfo(params) {
    return  request({
        method: 'DELETE',
        url: '/knowledge_base/kb/testenv/authDog/info',
        params,
    })
}




// 数据库环境

export function PostKnowledgeBaseTestEnvDataBaseInfoList(data) {
    return  request({
        method: 'POST',
        url: '/knowledge_base/kb/testenv/database/list',
        data,
    })
}


export function GetKnowledgeBaseTestEnvDataBaseInfoSelect(data) {
    return  request({
        method: 'GET',
        url: '/knowledge_base/kb/testenv/database/select',
        data,
    })
}



export function PostKnowledgeBaseTestEnvDataBaseInfoPost(data) {
    return  request({
        method: 'POST',
        url: '/knowledge_base/kb/testenv/database/info',
        data,
    })
}


export function DeleteKnowledgeBaseTestEnvDataBaseInfo(params) {
    return  request({
        method: 'DELETE',
        url: '/knowledge_base/kb/testenv/database/info',
        params,
    })
}


