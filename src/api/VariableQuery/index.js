import {request} from '@/utils/request'

// variable of database
export function postDataBaseList(data) {
    return request.post("variable_query/database/list", data)
}

export function postDatabaseInfo(data) {
    return request.post("variable_query/database/info", data)
}

export function deleteDatabaseInfo(params) {
    return request.delete("variable_query/database/info", params)
}

export function postDatabaseServer(data) {
    return request.post("variable_query/database/server", data)
}
