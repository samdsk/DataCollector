const { DataProvider } = require("../Models/DataProvider");
const TextService = require("./TextService");
const TransactionWrapper = require("../db/TransactionWrapper");
const ValidationError = require("../Errors/ValidationError");

const opts = { runValidators: true };

const getIDByName = async (data_provider) => {
  const res = await DataProvider.findOne({
    data_provider: data_provider.toLowerCase(),
  }).select("_id");

  return res?._id || null;
};

const create = async (data_provider) => {
  if (typeof data_provider !== "string")
    throw new ValidationError(
      "must be a string",
      "DataProvider",
      "data_provider"
    );
  const name = data_provider.toLowerCase();

  const found = await DataProvider.exists({ data_provider: name });
  if (found) return null;

  return await DataProvider.create({
    data_provider: name,
  });
};

const getAll = async () => {
  return DataProvider.find({});
};

const deleteDataProvider = async (id, session) => {
  if (session) {
    return await deleteOperation(id, session);
  } else {
    return await TransactionWrapper.transactionWrapper(id, deleteOperation);
  }
};

const deleteOperation = async (id, session) => {
  const data_provider = await DataProvider.deleteOne({ _id: id }).session(
    session
  );
  const texts = await TextService.deleteMany({ data_provider: id }, session);
  return { data_provider: data_provider, texts: texts };
};

const updateDataProvider = async (id, data_provider) => {
  const found = await DataProvider.exists({ _id: id });
  if (!found) return null;

  return DataProvider.updateOne(
      {_id: id},
      {data_provider: data_provider},
      opts
  );
};

module.exports = {
  getIDByName,
  create,
  getAll,
  deleteDataProvider,
  updateDataProvider,
};
