export default async (__db) => {
  const DB = __db.collection('waybillrefs');
  const getLastSerialNumber = async () => {
    return new Promise(async (resolve) => {
      const counter = await __db.collection('waybillcounterrefs').findOne({});
      resolve(counter.serialNumber);
    });
  };
  const getWaybill = async (serialNumber) => {
    return new Promise(async (resolve, reject) => {
      const docs = await DB.find({ serialNumber }).toArray();
      resolve(docs);
    });
  };
  return new Promise(async (resolve, reject) => {
    let lastSerialNumber = await getLastSerialNumber();
    for (let i = 1; i <= lastSerialNumber; i++) {
      const wbData = await getWaybill(i);
      if (wbData.length === 2) {
        if (wbData[0].action === 'PRODUCTION') {
          const newWaybill = Object.assign({}, wbData[0], {
            transactions: [
              ...wbData[0].transactions,
              ...wbData[1].transactions,
            ],
            source: wbData[0].stock,
            destination: wbData[1].stock,
            type: [wbData[0].type, wbData[1].type],
            createdAt: wbData[0].createdAt,
            updatedAt: wbData[0].updatedAt,
          });
          delete newWaybill.active;
          delete newWaybill.stock;
          delete newWaybill._id;
          delete newWaybill.__v;
          await DB.deleteMany({ serialNumber: i });
          await DB.insertOne(newWaybill);
        }
        if (wbData[0].action === 'MOVE') {
          const outcomeWB = wbData.find((w) => w.type === 'OUTCOME');
          const incomeWB = wbData.find((w) => w.type === 'INCOME');
          const newWaybill = Object.assign({}, wbData[0], {
            transactions: [...incomeWB.transactions, ...outcomeWB.transactions],
            source: outcomeWB.stock,
            destination: incomeWB.stock,
            type: [incomeWB.type, outcomeWB.type],
            createdAt: incomeWB.createdAt,
            updatedAt: incomeWB.updatedAt,
          });
          delete newWaybill.active;
          delete newWaybill.stock;
          delete newWaybill._id;
          delete newWaybill.__v;
          await DB.deleteMany({ serialNumber: i });
          await DB.insertOne(newWaybill);
        }
        // break;
      } else if (wbData.length === 1) {
        // transform single
        try {
          await DB.updateOne(
            { serialNumber: i },
            {
              $set: {
                ...(wbData[0].type === 'INCOME'
                  ? {
                      destination: wbData[0].stock,
                      type: ['INCOME'],
                    }
                  : { source: wbData[0].stock, type: ['OUTCOME'] }),
              },
              $unset: {
                active: '',
                stock: '',
              },
            },
          );
        } catch (e) {
          console.log('INDEX: ', i, e);
          throw e;
        }
      }
      await DB.updateOne(
        { serialNumber: i },
        {
          $unset: {
            active: '',
          },
        },
      );
    }
    resolve();
  });
};
