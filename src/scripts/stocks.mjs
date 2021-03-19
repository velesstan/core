export default async (__db) => {
  let DB = __db.collection('stockrefs');
  let HOLDER_DB = __db.collection('holderrefs');
  return new Promise(async (resolve, reject) => {
    const stocks = await DB.find({}).toArray();
    DB.dropIndexes();
    for (let i = 0; i < stocks.length; i++) {
      try {
        await HOLDER_DB.insertOne({
          _id: stocks[i]._id,
          title: stocks[i].title,
          type: 'stock',
        });
      } catch (e) {
        console.log(stocks[i]);
        throw e;
      }
    }
    resolve();
  });
};
