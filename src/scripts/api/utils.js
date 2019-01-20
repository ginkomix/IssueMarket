import _ from 'lodash';

import { readAppToken } from '$common/auth';

export const unwrapTextResponse = function(response) {
  // Если запрос завершился ошибкой, пытаемся разобрать ее текст
  if (!response.ok) {
    return unwrapErrorResponse(response);
  }

  return response.text();
};

export const unwrapJsonResponse = function(response) {
  // Если запрос завершился ошибкой, пытаемся разобрать ее текст
  if (!response.ok) {
    return unwrapErrorResponse(response);
  }

  return response.json();
};

/**
 * Создать функцию-преобразователь результата запроса к серверу в локальные объекты
 *
 * @param {Function} [Constructor] Функция-конструктор
 * @returns {Function}
 */
export const prepareMapper = function(Constructor) {
  return function(data) {
    if (Array.isArray(data)) {
      return data.map((data) =>
        Constructor ? new Constructor(data) : data
      );
    }
    return Constructor ? new Constructor(data) : data;
  };
};

export const serializeQueryFilter = function(filter = {}) {
  let queryFilter = '';
  Object.keys(filter).forEach((key) => {
    if (filter[key] !== undefined) {
      if (_.isBoolean(filter[key]) && filter[key]) {
        queryFilter = `${queryFilter}&${encodeURIComponent(
          key
        )}`;
      } else if (!_.isEmpty(filter[key])) {
        queryFilter = `${queryFilter}&${encodeURIComponent(
          key
        )}=${encodeURIComponent(filter[key])}`;
      }
    }
  });

  return queryFilter;
};

export const serializeQuerySort = function(sort = {}) {
  let querySort = '';
  if (sort.name) {
    querySort = `&sort=${sort.dir > 0 ? '' : '-'}${
      sort.name
    }`;
  }
  return querySort;
};

export const serializeQueryPagination = function(
  pagination
) {
  let queryPagination = '';
  if (pagination) {
    queryPagination += `&pageSize=${pagination.pageSize ||
      100}`;
    queryPagination += `&skip=${pagination.skip || 0}`;
  }

  return queryPagination;
};

class Http {
  /**
   * GET запрос
   *
   * @param {String} url         Адрес
   * @param {Object} [options]   Параметры
   * @promise {*}
   */
  get(url, options) {
    return doFetch('get', url, options);
  }

  /**
   * POST запрос
   *
   * @param {String} url         Адрес
   * @param {Object} [options]   Параметры
   * @promise {*}
   */
  post(url, options) {
    return doFetch('post', url, options);
  }

  /**
   * PUT запрос
   *
   * @param {String} url         Адрес
   * @param {Object} [options]   Параметры
   * @promise {*}
   */
  put(url, options) {
    return doFetch('put', url, options);
  }

  /**
   * DELETE запрос
   *
   * @param {String} url         Адрес
   * @param {Object} [options]   Параметры
   * @promise {*}
   */
  delete(url, options) {
    return doFetch('delete', url, options);
  }
}

/**
 * Вспомогательные методы для запросов к серверу
 * @type {Http}
 */
export const http = new Http();

/**
 * Обертка вокруг HTML fetch, для установки обязательных заголовков
 *
 * @param {String}          method      HTTP метод
 * @param {String|Response} url         Адрес или запрос
 * @param {Object}          [options]   Настройки запроса
 * @promise {*}
 */
function doFetch(method, url, options = {}) {
  // Адрес
  const formattedUrl = formatServerUrl(url, options.query);
  // Параметры запроса

  const fetchOptions = {
    method,
    headers: new Headers()
  };

  // Тело запроса
  if (options.body) {
    let body = options.body;
    if (_.isObject(body)) {
      // Если есть функция, подготавливающая объект к запросу, то заменим его на результат ее вызова
      if (_.isFunction(body.prepareForRequest)) {
        body = body.prepareForRequest();
      }
      body = JSON.stringify(body);
    }
    fetchOptions.body = body;
  }

  // Заголовки
  fetchOptions.headers.set('Accept', 'application/json');
  fetchOptions.headers.set(
    'Content-Type',
    'application/json; charset=utf-8'
  );

  // Аутентификация
  if (!options.noAuth) {
    const authToken = options.authToken || readAppToken();
    if (authToken) {
      fetchOptions.headers.set(
        'Authorization',
        `Bearer ${authToken}`
      );
    }
  }

  return window.fetch(formattedUrl, fetchOptions);
}

function formatServerUrl(route, params) {
  let url = (route || '').trim();

  // Параметры
  let paramsText = '';
  if (_.isObject(params)) {
    Object.keys(params).forEach((key) => {
      if (params[key]) {
        paramsText += paramsText.length > 0 ? '&' : '';
        paramsText += `${key}=${params[key]}`;
      }
    });
  }

  if (!_.isEmpty(paramsText)) {
    url += `?${paramsText}`;
  }

  // Возможно URI уже был подготовлен
  if (url.search(/^http/i) >= 0) {
    return url;
  }

  // Если передали только часть URL, то объединяем с адресом сервера
  if (url[0] !== '/') {
    url = `/${url}`;
  }
  return `${process.env.API_ENDPOINT}${url}`;
}

function unwrapErrorResponse(response) {
  // Если код ошибки - 500, то в теле должно быть описание ошибки в формате JSON ...
  if (response.status === 500) {
    return response.json().then((error) => {
      throw new Error(error.message);
    });
  }
  // ... иначе пытаемся прочитать ее как текст
  return response.text().then((error) => {
    if (!_.isEmpty(error)) {
      throw new Error(error);
    }

    // Если в теле ответа было пусто, то используем описание статуса ответа
    throw new Error(response.statusText);
  });
}
