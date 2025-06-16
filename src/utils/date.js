// src/utils/date.js

/**
 * 格式化日期字符串或时间戳为 "YYYY-MM-DD HH:mm:ss"
 * @param {String|Number|Date} value  要格式化的日期，支持 Date 对象、时间戳或可被 new Date() 解析的字符串
 * @param {String} formatStr （可选）自定义输出格式，目前仅支持 'YYYY-MM-DD HH:mm:ss'
 */
export function formatDate(value, formatStr = "YYYY-MM-DD HH:mm:ss") {
  if (!value) return "";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "-"; // 如果传入无法解析的值，则返回 "-"

  const pad = (n) => String(n).padStart(2, "0");
  const Y = date.getFullYear();
  const M = pad(date.getMonth() + 1);
  const D = pad(date.getDate());
  const h = pad(date.getHours());
  const m = pad(date.getMinutes());
  const s = pad(date.getSeconds());

  // 这里简单处理 formatStr，默认就返回 "YYYY-MM-DD HH:mm:ss"
  if (formatStr === "YYYY-MM-DD HH:mm:ss") {
    return `${Y}-${M}-${D} ${h}:${m}:${s}`;
  }
  // 如果你想支持更多格式，可以在这里自行扩展
  return `${Y}-${M}-${D} ${h}:${m}:${s}`;
}
