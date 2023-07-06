'use strict';

const queryNestedId = (idField) => {
  const quryField = idField.replace('Id', '');  
  return (req, res, next) => {
    const id = req.params[idField];
    if (id) req.query[quryField] = id;
    next();
  };
};

module.exports = queryNestedId;
