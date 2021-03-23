export default async (__db) => {
  let DB = __db.collection('stockrefs');
  let HOLDER_DB = __db.collection('holderrefs');
  return new Promise(async (resolve, reject) => {
    const stocks = await DB.find({}).toArray();
    try {
      await HOLDER_DB.deleteMany();
    } catch (e) {
      console.log(e);
    }
    // DB.dropIndexes();
    for (let i = 0; i < stocks.length; i++) {
      try {
        await HOLDER_DB.insertOne({
          _id: stocks[i]._id,
          title: stocks[i].title,
          createdAt: stocks[i].createdAt,
          updatedAt: stocks[i].updatedAt,
          type: 'stock',
        });
        await DB.deleteOne({ _id: stocks[i]._id });
      } catch (e) {
        console.log(stocks[i]);
        throw e;
      }
    }

    resolve();
  });
};
