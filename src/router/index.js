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
                meta: { title: 'HomePage', icon: 'home' }
            },
            {
                path: 'backend/variable-query',
                name: 'VariableQuery',
                component: () => import('@/views/Backend/VariableQuery/VariableQuery.vue'),
                meta: { title: 'VariableQuery', icon: 'home' }
            },
            {
                path: 'backend/message-server/webhook',
                name: 'MessageWebhook',
                component: () => import('@/views/Backend/MessageServer/MessageWebhook.vue'),
                meta: { title: 'MessageWebhook', icon: 'home' }
            },
            {
                path: 'backend/message-server/template',
                name: 'MessageTemplate',
                component: () => import('@/views/Backend/MessageServer/MessageTemplate.vue'),
                meta: { title: 'MessageTemplate', icon: 'home' }
            },
            {
                path: 'backend/ai-server/model-config',
                name: 'AiModelConfig.vue',
                component: () => import('@/views/Backend/AiServer/AiModelConfig.vue'),
                meta: { title: 'AiModelConfig.vue', icon: 'home' }
            },
            {
                path: 'backend/ai-server/agent-config',
                name: 'AiAgentConfig',
                component: () => import('@/views/Backend/AiServer/AiAgentConfig.vue'),
                meta: { title: 'AiAgentConfig', icon: 'home' }
            },
            {
                path: 'backend/ai-evaluation/ai-dataset',
                name: 'AiDataset',
                component: () => import('@/views/Backend/AiEvaluation/AiDataset.vue'),
                meta: { title: 'AiDataset', icon: 'home' }
            }
            ,
            {
                path: 'backend/ai-evaluation/ai-evaluation-target',
                name: 'AiEvaluationTarget',
                component: () => import('@/views/Backend/AiEvaluation/AiEvaluationTarget.vue'),
                meta: { title: 'AiEvaluationTarget', icon: 'home' }
            } ,
            {
                path: 'backend/ai-evaluation/ai-evaluatort',
                name: 'AiEvaluator',
                component: () => import('@/views/Backend/AiEvaluation/AiEvaluator.vue'),
                meta: { title: 'AiEvaluator', icon: 'home' }
            }
            
           
        ]
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes: routes
})

export default router