const Transaction = require("../models/Transaction");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");

const getRevenueReport = async (req, res) => {
  try {
    const { from, to } = req.query;

    const fromDate = from ? new Date(from) : new Date(new Date().getFullYear(), 0, 1);
    const toDate = to ? new Date(to) : new Date();

    // 1. Dữ liệu cho các thẻ thống kê, trạng thái đơn, dịch vụ (trong khoảng fromDate -> toDate)
    const periodTransactions = await Transaction.find({
      transaction_date: { $gte: fromDate, $lte: toDate },
    });

    const periodOrders = await Order.find({
      created_at: { $gte: fromDate, $lte: toDate },
    });

    const orderIds = periodOrders.map((o) => o._id);
    const periodOrderItems = await OrderItem.find({
      order_id: { $in: orderIds },
    }).populate("service_id", "name");

    // Summary stats
    const totalOrders = periodOrders.length;
    const totalAmount = periodOrders.reduce((s, o) => s + (o.total_amount || 0), 0);
    const paid = periodOrders.filter((o) => o.payment_status === "PAID");
    const paidOrders = paid.length;
    const paidAmount = paid.reduce((s, o) => s + (o.total_amount || 0), 0);
    const unpaidActive = periodOrders.filter(
      (o) => o.payment_status !== "PAID" && o.status !== "CANCELLED" && o.status !== "COMPLETED"
    );
    const unpaidActiveOrders = unpaidActive.length;
    const unpaidActiveAmount = unpaidActive.reduce((s, o) => s + (o.total_amount || 0), 0);
    const debt = periodOrders.filter(
      (o) => o.payment_status !== "PAID" && o.status === "COMPLETED"
    );
    const debtOrders = debt.length;
    const debtAmount = debt.reduce((s, o) => s + (o.total_amount || 0), 0);

    const summaryStats = {
      totalOrders,
      totalAmount,
      paidOrders,
      paidAmount,
      unpaidActiveOrders,
      unpaidActiveAmount,
      debtOrders,
      debtAmount,
    };

    // Order status
    const statusCounts = {};
    const ALL_STATUSES = [
      "RECEIVED",
      "PENDING_ITEMS",
      "ITEMS_READY",
      "WASHING",
      "READY",
      "COMPLETED",
      "CANCELLED",
    ];
    periodOrders.forEach((o) => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    });
    const orderStatusData = ALL_STATUSES.map((s) => ({
      status: s,
      count: statusCounts[s] || 0,
    }));

    // Top services
    const svcCounts = {};
    periodOrderItems.forEach((item) => {
      const name = item.service_id?.name ?? "Khác";
      svcCounts[name] = (svcCounts[name] || 0) + (Number(item.quantity) || 1);
    });
    const topServices = Object.entries(svcCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 2. Dữ liệu cho biểu đồ và bảng theo năm (CẢ NĂM của fromDate)
    const year = fromDate.getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

    const yearTransactions = await Transaction.find({
      transaction_date: { $gte: startOfYear, $lte: endOfYear },
    });

    const yearOrders = await Order.find({
      created_at: { $gte: startOfYear, $lte: endOfYear },
    });

    const buckets = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      year: year,
      revenue: 0,
      expense: 0,
    }));

    yearTransactions.forEach((t) => {
      const dateStr = t.transaction_date || t.created_at;
      if (dateStr) {
        const m = new Date(dateStr).getMonth();
        if (buckets[m]) {
          if (t.type === "INCOME") buckets[m].revenue += (t.amount || 0);
          else if (t.type === "EXPENSE") buckets[m].expense += (t.amount || 0);
        }
      }
    });

    yearOrders.forEach((o) => {
      if (o.payment_status === "PAID") {
        const dateStr = o.created_at;
        if (dateStr) {
          const m = new Date(dateStr).getMonth();
          if (buckets[m]) buckets[m].revenue += (o.total_amount || 0);
        }
      }
    });

    return res.json({
      monthlyData: buckets,
      orderStatusData,
      topServices,
      summaryStats,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getFundReport = async (req, res) => {
  try {
    const { from, to } = req.query;

    const fromDate = from ? new Date(from) : new Date();
    if (!from) {
      fromDate.setHours(0, 0, 0, 0);
    }
    const toDate = to ? new Date(to) : new Date();
    if (!to) {
      toDate.setHours(23, 59, 59, 999);
    }

    // A. Số dư trước phát sinh
    // 1. Giao dịch thu/chi trước fromDate
    const pastTransactions = await Transaction.find({
      transaction_date: { $lt: fromDate },
    });
    
    // 2. Các đơn hàng đã thu tiền trước fromDate
    const pastOrders = await Order.find({
      created_at: { $lt: fromDate },
      payment_status: "PAID",
    });

    let previousBalance = 0;
    
    pastTransactions.forEach((t) => {
      if (t.type === "INCOME") previousBalance += (t.amount || 0);
      else if (t.type === "EXPENSE") previousBalance -= (t.amount || 0);
    });

    pastOrders.forEach((o) => {
      previousBalance += (o.total_amount || 0);
    });

    // B. Trong khoản thời gian (from -> to)
    const periodTransactions = await Transaction.find({
      transaction_date: { $gte: fromDate, $lte: toDate },
    });

    const periodOrders = await Order.find({
      created_at: { $gte: fromDate, $lte: toDate },
    });

    let periodServiceIncome = 0;
    let periodOtherIncome = 0;
    let periodExpense = 0;
    let periodUnpaidService = 0;

    periodTransactions.forEach((t) => {
      if (t.type === "INCOME") periodOtherIncome += (t.amount || 0);
      else if (t.type === "EXPENSE") periodExpense += (t.amount || 0);
    });

    periodOrders.forEach((o) => {
      if (o.payment_status === "PAID") {
        periodServiceIncome += (o.total_amount || 0);
      } else if (o.status !== "CANCELLED") { // Cancelled order is not unpaid debt
        periodUnpaidService += (o.total_amount || 0); // Need to collect
      }
    });

    res.json({
      previousBalance,
      periodServiceIncome,
      periodOtherIncome,
      periodExpense,
      periodUnpaidService,
      // Tính sẵn
      totalIncome: periodServiceIncome + periodOtherIncome,
      currentBalance: previousBalance + periodServiceIncome + periodOtherIncome - periodExpense,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getRevenueReport,
  getFundReport,
};