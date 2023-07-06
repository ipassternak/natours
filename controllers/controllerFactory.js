'use strict';

const prepareQuery = require('../utils/prepareQuery');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { QUERY_EXCLUDED_FIELDS } = require('../constants/appConstants');

class ControllerFactory {
  constructor(Model) {
    const modelName = Model.modelName.toLowerCase();
    this.Model = Model;
    this.modelName = modelName;
    this.idError = new AppError(`Invalid ${modelName} ID!`, 404);
  }

  getAll(options) {
    const { Model, modelName } = this;
    const pluralModelName = options?.pluralForm || `${modelName}s`;
    const doQuery = prepareQuery(Model, ...QUERY_EXCLUDED_FIELDS);
    return catchAsync(async (req, res) => {
      const docs = await doQuery(req.query).select('-__v');
      const data = { [pluralModelName]: docs };
      res.status(200).json({
        status: 'success',
        results: docs.length,
        data,
      });
    });
  }

  getOne(options) {
    const { Model, modelName, idError } = this;
    return catchAsync(async (req, res) => {
      const doc = await Model.findById(req.params.id).populate(
        options?.populate
      );
      if (!doc) throw idError;
      const data = { [modelName]: doc };
      res.status(200).json({
        status: 'success',
        data,
      });
    });
  }

  createOne() {
    const { Model, modelName } = this;
    return catchAsync(async (req, res) => {
      const doc = await Model.create(req.body);
      const data = { [modelName]: doc };
      res.status(201).json({
        status: 'success',
        data,
      });
    });
  }

  updateOne() {
    const { Model, modelName, idError } = this;
    return catchAsync(async (req, res) => {
      const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      const data = { [modelName]: doc };
      if (!doc) throw idError;
      res.status(200).json({
        status: 'success',
        data,
      });
    });
  }

  deleteOne() {
    const { Model, idError } = this;
    return catchAsync(async (req, res) => {
      const doc = await Model.findByIdAndDelete(req.params.id);
      if (!doc) throw idError;
      res.status(204).json({
        status: 'success',
        data: null,
      });
    });
  }
}

module.exports = ControllerFactory;
