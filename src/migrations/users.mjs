import bcrypt from 'bcrypt';

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
            $set: {
              username: users[i].email,
              role: users[i].email == 'admin@veles.services' ? 'admin' : 'user',
              password: await bcrypt.hash(users[i].password, 10),
            },
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
