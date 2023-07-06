'use strict';

const { ALLOWED_QUERY_OPERATORS } = require('../constants/appConstants');

const excludeFields = (obj, ...excluded) => {
  const res = {};
  const fields = Object.keys(obj);
  for (const field of fields) {
    if (!excluded.includes(field)) {
      const value = obj[field];
      res[field] = value;
    }
  }
  return res;
};

const fixQueryString = (queried) => queried?.replaceAll(',', ' ') || '';

const pagination = (page = '1', limit = '100') => {
  const nPage = parseInt(page);
  const nLimit = parseInt(limit);
  const skip = (nPage - 1) * nLimit;
  return [skip, nLimit];
};

const fixFilterQuery = (query) => {
  const res = {};
  const keys = Object.keys(query);
  for (const key of keys) {
    const value = query[key];
    if (typeof value === 'object') {
      const operator = Object.keys(value).toString();
      if (ALLOWED_QUERY_OPERATORS.includes(operator)) {
        const fixed = `$${operator}`;
        res[key] = { [fixed]: value[operator] };
      }
    } else {
      res[key] = value;
    }
  }
  return res;
};

const prepareQuery =
  (Model, ...filterIgnore) =>
  (query) => {
    const filterBy = fixFilterQuery(excludeFields(query, ...filterIgnore));
    const sortBy = fixQueryString(query.sort);
    const selectBy = fixQueryString(query.fields);
    const [skipBy, limitBy] = pagination(query.page, query.limit);
    return Model?.find(filterBy)
      .sort(sortBy)
      .select(selectBy)
      .skip(skipBy)
      .limit(limitBy);
  };

module.exports = prepareQuery;
