export default async (__db) => {
  const DB = __db.collection('userrefs');

  return new Promise(async (resolve, reject) => {
    const users = await DB.find({}).toArray();
    DB.dropIndexes();
    for (let i = 0; i < users.length; i++) {
      try {
        await DB.updateOne(
          { _id: users[i]._id },
          {
            ...(users[i].email ? { $set: { username: users[i].email } } : {}),
            $unset: {
              email: '',
            },
          },
        );
      } catch (e) {
        console.log(users[i]);
        throw e;
      }
    }
    resolve();
  });
};
