import {request} from '@/utils/request'

// model
export function postModelList(data) {
    return request.post("ai_server/model/list", data)
}

export function postModelInfo(data) {
    return request.post("ai_server/model/info", data)
}

export function deleteModelInfo(params) {
    return request.delete("ai_server/model/info", params)
}

// agent
export function postAgentList(data) {
    return request.post("ai_server/agent/list", data)
}

export function postAgentInfo(data) {
    return request.post("ai_server/agent/info", data)
}

export function deleteAgentInfo(params) {
    return request.delete("ai_server/agent/info", params)
}

export function postAgentServer(data) {
    return request.post("ai_server/agent/server", data)
}

export function postAgentServerStream(data) {
    return request.post("ai_server/agent/server_stream", data)
}