export default async (__db) => {
  const TRANSACTIONS = __db.collection('transactionrefs');
  const PRODUCTS = __db.collection('productrefs');

  const getProduct = async (id) =>
    new Promise(async (resolve, reject) => {
      const product = await PRODUCTS.findOne({ _id: id });
      resolve(product);
    });
  return new Promise(async (resolve, reject) => {
    const transactions = await TRANSACTIONS.find({
      type: { $exists: true },
    }).toArray();
    for (let i = 0; i < transactions.length; i++) {
      const t = transactions[i];
      await TRANSACTIONS.updateOne(
        { _id: transactions[i]._id },
        {
          $unset: {},
        },
      );
    }

    resolve();
  });
};
