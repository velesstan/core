import { WaybillAction } from 'src/common/enums';
import { WaybillModel } from 'src/common/interfaces';

export default (waybill: WaybillModel) => {
  const { action, transactions } = waybill.toObject();
  switch (action) {
    case WaybillAction.BUY:
    case WaybillAction.IMPORT: {
      return transactions;
    }
    case WaybillAction.SELL:
    case WaybillAction.UTILIZATION: {
      return transactions.map((t) => ({
        ...t,
        quantity: Math.abs(t.quantity),
      }));
    }
    case WaybillAction.MOVE: {
      return transactions.filter((t) => t.quantity > 0);
    }
    case WaybillAction.PRODUCTION: {
      return transactions.filter((t) => t.quantity > 0);
    }
  }
};
