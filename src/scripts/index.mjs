import MongoDB from 'mongodb';

import mergeWaybills from './waybills.mjs';
import mergeUsers from './users.mjs';
import mergeStocks from './stocks.mjs';
import mergeTransactions from './transactions.mjs';

const mongoClient = new MongoDB.MongoClient(
  'mongodb://root:@localhost/?authSource=admin',
  {
    useUnifiedTopology: true,
  },
);
mongoClient.connect(async (err, client) => {
  if (err) console.error(err);
  else {
    const db = client.db('core-veles');
    await mergeWaybills(db);
    await mergeUsers(db);
    await mergeStocks(db);
    await mergeTransactions(db);
  }
  client.close();
});
