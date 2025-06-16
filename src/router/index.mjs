import {createRouter, createWebHashHistory} from 'vue-router'
import BaseLayout from '@/layout/BaseLayout.vue'

const routes = [
    {
        path: '/',
        component: BaseLayout,
        redirect: '/home',
        children: [
            {
                path: 'home',
                name: 'HomePage',
                component: () => import('@/views/Home/HomePage.vue'),
                meta: { title: '首页', icon: 'home',path:'/home' }
            },
            {
                path: 'backend/variable-query',
                name: 'VariableQuery',
                component: () => import('@/views/Backend/VariableQuery/VariableQuery.vue'),
                meta: { title: '变量管理', icon: 'home',path:'/backend/variable-query' }
            },
            {
                path: 'backend/message-server/webhook',
                name: 'MessageWebhook',
                component: () => import('@/views/Backend/MessageServer/MessageWebhook.vue'),
                meta: { title: 'Webhook配置', icon: 'home',path:'/backend/message-server/webhook' }
            },
            {
                path: 'backend/message-server/template',
                name: 'MessageTemplate',
                component: () => import('@/views/Backend/MessageServer/MessageTemplate.vue'),
                meta: { title: '模板配置', icon: 'home',path:'/backend/message-server/template' }
            },
            {
                path: 'backend/ai-server/model-config',
                name: 'AiModelConfig.vue',
                component: () => import('@/views/Backend/AiServer/AiModelConfig.vue'),
                meta: { title: '模型配置', icon: 'home',path:'/backend/ai-server/model-config' }
            },
            {
                path: 'backend/ai-server/agent-config',
                name: 'AiAgentConfig',
                component: () => import('@/views/Backend/AiServer/AiAgentConfig.vue'),
                meta: { title: '智能体配置', icon: 'home',path:'/backend/ai-server/agent-config' }
            },
            {
                path: 'backend/ai-evaluation/ai-dataset',
                name: 'AiDataset',
                component: () => import('@/views/Backend/AiEvaluation/AiDataset.vue'),
                meta: { title: '数据集', icon: 'home',path:'/backend/ai-evaluation/ai-dataset' }
            }
            ,
            {
                path: 'backend/ai-evaluation/ai-evaluation-target',
                name: 'AiEvaluationTarget',
                component: () => import('@/views/Backend/AiEvaluation/AiEvaluationTarget.vue'),
                meta: { title: '评测对象', icon: 'home',path:'/backend/ai-evaluation/ai-evaluation-target' }
            } ,
            {
                path: 'backend/ai-evaluation/ai-evaluatort',
                name: 'AiEvaluator',
                component: () => import('@/views/Backend/AiEvaluation/AiEvaluator.vue'),
                meta: { title: '评估器', icon: 'home',path:'/backend/ai-evaluation/ai-evaluatort' }
            }, 
            {
                path: 'backend/ai-evaluation/ai-dataset-index',
                name: 'AiDatasetIndex',
                component: () => import('@/views/Backend/AiEvaluation/AiDatasetindex.vue'),
                meta: { title: '数据集', icon: 'home',path:'/backend/ai-evaluation/ai-dataset-index' },
                children: [
                    {
                        path:'node/:nodeId',
                        name:'nodeDetail',
                        component: () => import('@/views/Backend/AiEvaluation/components/FileContent.vue'),
                        meta: { title: '数据集', icon: 'home',path:'/backend/ai-evaluation/ai-dataset-index' },
                        props: true
                    },
                ]
            },
            // 测试环境
            {
                path: 'backend/knowledge-base/test-env',
                name: 'KnowledgeBaseTestEnvMainTain',
                component: () => import('@/views/Backend/KnowledgeBase/KnowledgeBaseTestEnvMainTain.vue'),
                meta: { title: '测试环境维护', icon: 'home',path:'/backend/knowledge-base/test-env' }
            },
            // 数据库环境信息
            {
                path: 'backend/knowledge-base/test-env/system-database',
                name: 'KnowledgeBaseTestEnvSystemDatabase',
                component: () => import('@/views/Backend/KnowledgeBase/KnowledgeBaseTestEnvSystemDatabase.vue'),
                meta: { title: '数据库环境维护', icon: 'home',path:'/backend/knowledge-base/test-env/system-database' }
            },
            // 加密狗信息
            {
                path: 'backend/knowledge-base/test-env/auth-dog',
                name: 'KnowledgeBaseTestEnvAuthDogServers',
                component: () => import('@/views/Backend/KnowledgeBase/KnowledgeBaseTestEnvAuthDogServers.vue'),
                meta: { title: '加密狗维护', icon: 'home',path:'/backend/knowledge-base/test-env/auth-dog' }
            },
            // Faq信息
            {
                path: 'backend/knowledge-base/faq',
                name: 'KnowledgeBaseFaqUnfile',
                component: () => import('@/views/Backend/KnowledgeBase/KnowledgeBaseFaqUnfile.vue'),
                meta: { title: 'Faq管理', icon: 'home',path:'/backend/knowledge-base/faq' }
            },
            // 文件上传 
            {
                path: 'backend/knowledge-base/file-upload',
                name: 'KnowledgeBaseFileUpload',
                component: () => import('@/views/Backend/KnowledgeBase/KnowledgeBaseFilesUpload.vue'),
                meta: { title: '文件上传', icon: 'home',path:'/backend/knowledge-base/file-upload' }
            },
            {
                path:'backend/ai-evaluation/components/file-process/:nodeId/:fileId/:datasetId',
                name:'fileProcess',
                component: () => import('@/views/Backend/AiEvaluation/components/FileProcess.vue'),
                meta: { title: '文件处理', icon: 'home',path:'/backend/ai-evaluation/components/file-process' },
                props: true
            },
                        {
                path:'backend/test-cases/demand-analysis',
                name:'DemandAnalysis',
                component:()=>import('@/views/Backend/TestCases/DemandAnalysis.vue'),
                meta:{title:'需求分析',icon:'home',path:'/backend/test-cases/demand-analysis'}
            },
            {
                path:'backend/test-cases/demand-management',
                name:'DemandManagement',
                component:()=>import('@/views/Backend/TestCases/MenuInspection.vue'),
                meta:{title:'菜单巡查',icon:'home',path:'/backend/test-cases/demand-management'}
            },
            {
                path:'backend/ai-evaluation/components/evaluator-detail/:id',
                name:'EvaluatorDetails',
                component: () => import('@/views/Backend/AiEvaluation/components/EvaluatorDetails.vue'),
                meta: { title: '评估器详情', icon: 'home',path:'/backend/ai-evaluation/components/evaluator-detail' },
            },
            {
                path:'backend/test-cases/test-generation',
                name:'TestGeneration',
                component:()=>import('@/views/Backend/TestCases/TestGeneration.vue'),
                meta:{title:'用例生成',icon:'home',path:'/backend/test-cases/test-generation'}
            },
            {
                path:'backend/test-cases/components/test-flow-testcase/:id',
                name:'TestFlowTestCase',
                component:()=>import('@/views/Backend/TestCases/components/TestFlowTestcase.vue'),
                meta:{title:'测试用例',icon:'home',path:'/backend/test-cases/components/test-flow-testcase/:id'}
            }
        ]
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes: routes
})

export default router