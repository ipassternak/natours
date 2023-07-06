'use strict';

const AsyncFunction = (async () => {}).constructor;

const catchAsync = (fn) => {
  if (!(fn instanceof AsyncFunction))
    throw new Error('Function must be asynchronous!');
  return (...args) => {
    const handler = args[args.length - 1];
    if (typeof handler !== 'function')
      throw new Error('Handler not a function!');
    fn(...args).catch(handler);
  };
};

module.exports = catchAsync;
