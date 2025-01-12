const Order_details = require("../models/order_details");
const Orders = require("../models/orders");
const Pant_shirt_size_detail = require("../models/pant_shirt_size_detail");
const excelJs = require("exceljs");

const getStatistic = async (req, res, next) => {
  try {
    const year = req.params.year;

    const startDate = new Date(`${year}-01-01T00:00:00Z`);
    const endDate = new Date(`${year}-12-31T23:59:59Z`);

    const orders = await Orders.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    const products = await Order_details.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    const totalByMonth = orders.reduce((acc, item) => {
      const monthYear = item.createdAt.toISOString().slice(5, 7); // Lấy tháng và năm (YYYY-MM)

      if (!acc[monthYear]) {
        acc[monthYear] = 0; // Khởi tạo nếu chưa có
      }

      acc[monthYear] += item.total_price; // Cộng số lượng vào tháng tương ứng
      return acc;
    }, {});

    console.log(totalByMonth);

    const revenue = orders
      .map((order) => order.total_price)
      .reduce((acc, price) => acc + price, 0);

    const countAccessory = products.reduce((sum, item) => {
      if (item.accessory_id) {
        return sum + item.quantity;
      }
      return sum;
    }, 0);

    const countShoes = products.reduce((sum, item) => {
      if (item.shoes_size_detail_id) {
        return sum + item.quantity;
      }
      return sum;
    }, 0);
    const countTshirtPants = products.reduce((sum, item) => {
      if (item.pant_shirt_size_detail_id) {
        return sum + item.quantity;
      }
      return sum;
    }, 0);

    const TshirtPants = products.filter(
      (item) => item.pant_shirt_size_detail_id !== null
    );
    let countTshirt = 0;
    let countPant = 0;
    await Promise.all(
      TshirtPants.map(async (item) => {
        const id = item.pant_shirt_size_detail_id;
        const Tshirt = await Pant_shirt_size_detail.findOne({ _id: id });

        if (Tshirt?.tshirt_id) {
          countTshirt += item.quantity;
        } else {
          countPant += item.quantity;
        }
      })
    );

    const uniqueAccountIds = new Set(
      orders.map((order) => order.account_id + "")
      // .filter(accountId => accountId !== undefined)
    );

    console.log(uniqueAccountIds.size);

    const rs = {
      revenue: revenue,
      products: products.length,
      orders: orders.length,
      ordersByMonth: totalByMonth,
      accountNumber: uniqueAccountIds.size,
      tshirtsNumber: countTshirt,
      pantsNumber: countPant,
      shoesNumber: countShoes,
      accessories: countAccessory,
    };

    res.json(rs);
  } catch (error) {
    console.log(error);
  }
};
const exportExcel = async (req, res, next) => {
  let { statistic, ordersByMonth, numberOfCategory } = req.body;
  try {
    let workbook = new excelJs.Workbook();
    const sheet = workbook.addWorksheet("statistic");
    console.log(numberOfCategory);

    sheet.mergeCells("A1", "H1");
    sheet.getCell("A1").value = "Statistic";
    sheet.getCell("A1").alignment = { horizontal: "center" };

    for (let rowIndex = 1; rowIndex <= 12; rowIndex++) {
      const cell = sheet.getCell(`A${rowIndex}`);
      const cell1 = sheet.getCell(`B${rowIndex}`);
      cell.font = { size: 15, bold: true };
      cell1.font = { size: 15, bold: true };
    }
    sheet.getCell("A1").font = { size: 18, bold: true };

    sheet.getCell("A2").value = "Revenue";
    sheet.getCell("B2").value = statistic.revenue + "đ";
    sheet.getCell("A3").value = "Products";
    sheet.getCell("B3").value = statistic.products;
    sheet.getCell("A4").value = "Customer Number";
    sheet.getCell("B4").value = statistic.accountNumber;
    sheet.getCell("A5").value = "Orders";
    sheet.getCell("B5").value = statistic.orders;
    sheet.getCell("A6").value = "Tshirts Number";
    sheet.getCell("B6").value = statistic.tshirtsNumber;
    sheet.getCell("A7").value = "Pants Number";
    sheet.getCell("B7").value = statistic.pantsNumber;
    sheet.getCell("A8").value = "Shoes Number";
    sheet.getCell("B8").value = statistic.shoesNumber;
    sheet.getCell("A9").value = "Accessories";
    sheet.getCell("B9").value = statistic.accessories;

    for (let rowIndex = 2; rowIndex <= 13; rowIndex++) {
      const cell = sheet.getCell(`E${rowIndex}`);
      const cellValue = sheet.getCell(`F${rowIndex}`);
      cell.value = ordersByMonth[rowIndex - 2].name;
      cellValue.value = ordersByMonth[rowIndex - 2].orders
        ? ordersByMonth[rowIndex - 2].orders + "đ"
        : "0đ";
      cell.font = { size: 15, bold: true };
      cellValue.font = { size: 15, bold: true };
    }
    sheet.getColumn("A").width = 30;
    sheet.getColumn("E").width = 30;
    sheet.getColumn("B").width = 30;
    sheet.getColumn("F").width = 30;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=account_data.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error generating Excel file:", error);
    res.status(500).send("Error generating Excel file");
  }
};

module.exports = { getStatistic, exportExcel };
