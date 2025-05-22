import {request} from '@/utils/request'

// webhook
export function postWebhookList(data) {
    return request.post("message_server/webhook/list", data)
}

export function postWebhookInfo(data) {
    return request.post("message_server/webhook/info", data)
}

export function deleteWebhookInfo(params) {
    return request.delete("message_server/webhook/info", params)
}

export function postWebhookServer(data) {
    return request.post("message_server/webhook/server", data)
}

// template
export function postTemplateList(data) {
    return request.post("message_server/template/list", data)
}

export function postTemplateInfo(data) {
    return request.post("message_server/template/info", data)
}

export function deleteTemplateInfo(params) {
    return request.delete("message_server/template/info", params)
}