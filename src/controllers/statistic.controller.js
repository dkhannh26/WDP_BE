const Order_details = require("../models/order_detail");
const Orders = require("../models/orders");
const Imports = require("../models/imports");
const excelJs = require("exceljs");
const Product_size = require("../models/product_size");
const Products = require("../models/products");
const Feedbacks = require("../models/feedbacks");

const getStatistic = async (req, res, next) => {
  try {
    const year = req.params.year;

    const startDate = new Date(`${year}-01-01T00:00:00Z`);
    const endDate = new Date(`${year}-12-31T23:59:59Z`);

    const imports = await Imports.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      }
    })

    const ratingOfCategory = await Feedbacks.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "product_id",
          foreignField: "_id",
          as: "product_info"
        }
      },
      {
        $unwind: "$product_info"
      },
      {
        $group: {
          _id: "$product_info.category",
          averageStar: { $avg: "$star" }
        }
      },
      {
        $project: {
          category: "$_id",
          averageStar: 1,
          _id: 0
        }
      }
    ]);

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

    const uniqueAccountIds = new Set(
      orders.map((order) => order.account_id + "")
      // .filter(accountId => accountId !== undefined)
    );



    const totalByMonth = orders.reduce((acc, item) => {
      const monthYear = item.createdAt.toISOString().slice(5, 7); // Lấy tháng

      if (!acc[monthYear]) {
        acc[monthYear] = 0; // Khởi tạo nếu chưa có
      }

      acc[monthYear] += item.total_price; // Cộng số lượng vào tháng tương ứng
      return acc;
    }, {});



    const revenue = orders
      .map((order) => order.total_price)
      .reduce((acc, price) => acc + price, 0);

    let countTshirt = 0;
    let countPant = 0;
    let countRacket = 0;
    let countShoes = 0;
    let countAccessory = 0

    await Promise.all(
      products.map(async (item) => {
        const id = item.product_size_id;
        const product_size = await Product_size.findOne({ _id: id });
        const product = await Products.findOne({ _id: product_size?.product_id })

        if (product?.category === 'racket') {
          countRacket += item.quantity;
        } else if (product?.category === 'tshirt') {
          countTshirt += item.quantity;
        } else if (product?.category === 'pant') {
          countPant += item.quantity;
        } else if (product?.category === 'shoes') {
          countShoes += item.quantity;
        } else if (product?.category === 'accessory') {
          countAccessory += item.quantity;
        }
      })
    );



    const rs = {
      imports: imports?.length,
      revenue: revenue,
      products: products.length,
      orders: orders.length,
      ordersByMonth: totalByMonth,
      accountNumber: uniqueAccountIds.size,
      ratingOfCategory: ratingOfCategory,
      racketNumber: countRacket,
      tshirtsNumber: countTshirt,
      pantsNumber: countPant,
      shoesNumber: countShoes,
      accessories: countAccessory,
    };

    // console.log(totalByMonth);

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
