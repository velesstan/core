// async find(query: FindWaybillDto): Promise<WaybillModel[]> {
//     const { start, end, stock, ...rest } = query;
//     const results = await this.waybillModel
//       .aggregate([
//         {
//           $match: {
//             ...rest,
//             ...(end
//               ? {
//                   createdAt: {
//                     $gte: start,
//                     $lte: end,
//                   },
//                 }
//               : {}),
//           },
//         },
//         {
//           $sort: {
//             createdAt: -1,
//           },
//         },
//         {
//           $limit: 20,
//         },
//         {
//           $lookup: {
//             from: 'userrefs',
//             localField: 'user',
//             foreignField: '_id',
//             as: 'user',
//           },
//         },
//         {
//           $unwind: '$user',
//         },
//         {
//           $lookup: {
//             from: 'holderrefs',
//             localField: 'source',
//             foreignField: '_id',
//             as: 'source',
//           },
//         },
//         {
//           $unwind: {
//             path: '$source',
//             preserveNullAndEmptyArrays: true,
//           },
//         },
//         {
//           $lookup: {
//             from: 'holderrefs',
//             localField: 'destination',
//             foreignField: '_id',
//             as: 'destination',
//           },
//         },
//         {
//           $unwind: {
//             path: '$destination',
//             preserveNullAndEmptyArrays: true,
//           },
//         },
//         {
//           $lookup: {
//             from: 'transactionrefs',
//             let: { transactionIDS: '$transactions' },
//             pipeline: [
//               {
//                 $match: {
//                   $expr: {
//                     $in: [
//                       '$_id',
//                       {
//                         $map: {
//                           input: '$$transactionIDS',
//                           in: {
//                             $toObjectId: '$$this',
//                           },
//                         },
//                       },
//                     ],
//                   },
//                 },
//               },
//               {
//                 $lookup: {
//                   from: 'productrefs',
//                   let: { product: '$product' },
//                   pipeline: [
//                     {
//                       $match: {
//                         $expr: {
//                           $eq: [{ $toObjectId: '$$product' }, '$_id'],
//                         },
//                       },
//                     },
//                     {
//                       $lookup: {
//                         from: 'categoryrefs',
//                         let: { category: '$category' },
//                         pipeline: [
//                           {
//                             $match: {
//                               $expr: {
//                                 $eq: [{ $toObjectId: '$$category' }, '$_id'],
//                               },
//                             },
//                           },
//                         ],
//                         as: 'category',
//                       },
//                     },
//                     {
//                       $unwind: '$category',
//                     },
//                   ],
//                   as: 'product',
//                 },
//               },
//               {
//                 $unwind: '$product',
//               },
//             ],
//             as: 'transactions',
//           },
//         },
//       ])
//       .exec();
//     return results;
//   }