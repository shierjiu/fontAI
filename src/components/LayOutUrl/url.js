



 function openQualityDashboard() {
  window.open('http://10.30.20.21:8080/webroot/decision/view/form?viewlet=qm/new/%E6%95%B0%E7%A7%91%E4%BA%A7%E5%93%81%E6%B5%8B%E8%AF%95%E9%83%A8%E8%B4%A8%E9%87%8F%E5%AF%BC%E8%88%AA%E6%A0%8F.frm', '_blank');
} 



 function openKnowledgeBaseDashboard() {
  // 检查是否有存储的token
  // const token = localStorage.getItem('knowledgeBaseToken');
  // const tokenExpiry = localStorage.getItem('knowledgeBaseTokenExpiry');
  //
  // if (token && tokenExpiry && new Date().getTime() < parseInt(tokenExpiry)) {
  //   // token有效，直接打开
  //   window.open(`http://10.48.3.23:8080/chatsnoopy/?supmenuhash=1748229360452#/&token=${token}`, '_blank');
  // } else {
  //   // 获取新token
  //   request.post('http://10.48.3.23:8080/msService/chatadmin/oemInfo/web/query')
  //     .then(response => {
  //       if (response.data.token) {
  //         // 存储token，设置过期时间（例如7天）
  //         const expiryTime = new Date().getTime() + (7 * 24 * 60 * 60 * 1000);
  //         localStorage.setItem('knowledgeBaseToken', response.data.token);
  //         localStorage.setItem('knowledgeBaseTokenExpiry', expiryTime.toString());

          // window.open(`http://10.48.3.23:8080/chatsnoopy/?supmenuhash=1748229360452#/&token=${response.data.token}`, '_blank');
         window.open(`http://10.48.3.23:8080/chatsnoopy/?supmenuhash=1748229360452#n}`, '_blank');
//         }
//
//       })
//       .catch(error => console.error('获取token失败:', error));
//   }
}

export { openQualityDashboard, openKnowledgeBaseDashboard };
