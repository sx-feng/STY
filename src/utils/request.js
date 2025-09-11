// request.js
// const baseURL = 'http://110.40.42.207:8088/';
const baseURL = 'http://192.168.1.4:8087/';

/**
 * 通用请求方法
 * @param {Number} methodFlag - 0 为 GET，1 为 POST
 * @param {String} url - 请求地址（相对 baseURL）
 * @param {Object} jsonData - 请求数据体
 * @param {Boolean} isquery - POST 是否转 query 参数
 * @returns {Promise<Object>} - 响应数据或错误码
 */
export function request(methodFlag, url, jsonData = {}, isquery = false) {
  return new Promise((resolve, reject) => {
    let finalUrl = baseURL + url;

    // 拼接 query 参数（适用于 GET 或 POST + isquery）
    if ((methodFlag === 0 && jsonData && Object.keys(jsonData).length > 0) || (methodFlag === 1 && isquery)) {
      const query = Object.entries(jsonData)
        .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
        .join('&');
      finalUrl += (url.includes('?') ? '&' : '?') + query;
    }

    const options = {
      method: methodFlag === 1 ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('token') || ''
      }
    };

    if (methodFlag === 1 && !isquery) {
      options.body = JSON.stringify(jsonData);
    }

    fetch(finalUrl, options)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Network response was not ok');
        }
      })
      .then(data => {
        resolve(data);
      })
      .catch(error => {
        reject(error);
      });
  });
}