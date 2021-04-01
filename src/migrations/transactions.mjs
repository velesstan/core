export default async (__db) => {
  const TRANSACTIONS = __db.collection('transactionrefs');
  const WAYBILLS = __db.collection('waybillrefs');
  const getWaybills = async () =>
    new Promise(async (resolve) => {
      const waybills = await WAYBILLS.find({}).toArray();
      resolve(waybills);
    });
  const getTransaction = async (id) =>
    new Promise(async (resolve) => {
      const $transaction = await TRANSACTIONS.findOne({ _id: id });
      resolve($transaction);
    });
  return new Promise(async (resolve, reject) => {
    const waybills = await getWaybills();
    for (let i = 0; i < waybills.length; i++) {
      const { action, type, transactions } = waybills[i];
      for (let j = 0; j < transactions.length; j++) {
        const $t = await getTransaction(transactions[j]);
        await TRANSACTIONS.updateOne(
          { _id: transactions[j] },
          {
            $set: {
              action,
              waybill: waybills[i].serialNumber,
              holder: $t.stock,
            },
            $unset: {
              active: '',
              type: '',
              holder: '',
            },
          },
        );
      }
    }
    resolve();
  });
};
