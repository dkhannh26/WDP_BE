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

    console.log(year);

    const startDate = new Date(`${year}-01-01T00:00:00Z`);
    const endDate = new Date(`${year}-12-31T23:59:59Z`);

    const imports = await Imports.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      }
    })

    const numberOfRating = await Feedbacks.find({
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
      status: "shipped"
    });



    const products = await Orders.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate
          },
          status: "shipped"
        }
      },
      {
        $lookup: {
          from: "order_details",
          localField: "_id",
          foreignField: "order_id",
          as: "order_details"
        }
      },
      {
        $unwind: "$order_details"
      },
      {
        $project: {
          order_id: "$_id",
          createdAt: 1,
          product_size_id: "$order_details.product_size_id",
          quantity: "$order_details.quantity",
        }
      }
    ])


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
        console.log(product);

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
      numberOfRating: numberOfRating.length,
      ratingOfCategory: ratingOfCategory,
      racketNumber: countRacket,
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

var blackBorder = {
  top: { style: 'medium', color: { argb: 'FF000000' } },
  left: { style: 'medium', color: { argb: 'FF000000' } },
  bottom: { style: 'medium', color: { argb: 'FF000000' } },
  right: { style: 'medium', color: { argb: 'FF000000' } }
};


const exportExcel = async (req, res, next) => {
  let { statistic, ordersByMonth, numberOfCategory, imports, ratings } = req.body;
  try {
    let workbook = new excelJs.Workbook();
    const sheet = workbook.addWorksheet("statistic");

    const startCol = 'A';
    const endCol = 'B';

    for (let row = 10; row <= 15; row++) {
      for (let colCharCode = startCol.charCodeAt(0); colCharCode <= endCol.charCodeAt(0); colCharCode++) {
        const colLetter = String.fromCharCode(colCharCode);
        const cellAddress = `${colLetter}${row}`;
        const cell = sheet.getCell(cellAddress);
        cell.border = blackBorder;
      }
    }

    for (let row = 3; row <= 15; row++) {
      for (let colCharCode = "E".charCodeAt(0); colCharCode <= "F".charCodeAt(0); colCharCode++) {
        const colLetter = String.fromCharCode(colCharCode);
        const cellAddress = `${colLetter}${row}`;
        const cell = sheet.getCell(cellAddress);
        cell.border = blackBorder;
      }
    }

    sheet.mergeCells("A1", "H1");
    sheet.getCell("A1").value = "Statistic";
    sheet.getCell("A1").alignment = { horizontal: "center" };
    sheet.mergeCells("A10", "B10");
    sheet.mergeCells("E3", "F3");
    sheet.getCell("A10").value = "Number of products sold";
    sheet.getCell("E3").value = "Monthly revenue";
    sheet.getCell("E3").font = { size: 15, bold: true };
    sheet.getCell("A10").font = { size: 15, bold: true };
    sheet.getCell("A10").alignment = { horizontal: "center" };

    for (let rowIndex = 3; rowIndex <= 8; rowIndex++) {
      const cell = sheet.getCell(`A${rowIndex}`);
      const cell1 = sheet.getCell(`B${rowIndex}`);
      cell1.border = blackBorder;
      cell.border = blackBorder;
      // cell.font = { size: 15, bold: true };
      // cell1.font = { size: 15, bold: true };
    }
    sheet.getCell("A1").font = { size: 18, bold: true };

    sheet.getCell("A3").value = "Total annual revenue";
    sheet.getCell("B3").value = statistic.revenue.toLocaleString('vi-VN') + "đ";
    sheet.getCell("A4").value = "Number of products sold";
    sheet.getCell("B4").value = statistic.products;
    sheet.getCell("A5").value = "Number of customers per year";
    sheet.getCell("B5").value = statistic.accountNumber;
    sheet.getCell("A6").value = "Number of order";
    sheet.getCell("B6").value = statistic.orders;
    sheet.getCell("A7").value = "Number of import";
    sheet.getCell("B7").value = imports;
    sheet.getCell("A8").value = "Number of rating product";
    sheet.getCell("B8").value = ratings;

    // sheet.getCell("B6").value = statistic.orders;
    sheet.getCell("A11").value = "Rackets";
    sheet.getCell("B11").value = statistic.racketNumber;
    sheet.getCell("A12").value = "Tshirts";
    sheet.getCell("B12").value = statistic.tshirtsNumber;
    sheet.getCell("A13").value = "Pants";
    sheet.getCell("B13").value = statistic.pantsNumber;
    sheet.getCell("A14").value = "Shoes";
    sheet.getCell("B14").value = statistic.shoesNumber;
    sheet.getCell("A15").value = "Accessories";
    sheet.getCell("B15").value = statistic.accessories;

    for (let rowIndex = 4; rowIndex <= 15; rowIndex++) {
      const cell = sheet.getCell(`E${rowIndex}`);
      const cellValue = sheet.getCell(`F${rowIndex}`);
      console.log(ordersByMonth[rowIndex - 4]);
      cell.value = ordersByMonth[rowIndex - 4].name;
      cellValue.value = ordersByMonth[rowIndex - 4].orders
        ? ordersByMonth[rowIndex - 4].orders.toLocaleString('vi-VN') + "đ"
        : "0đ";
      // cell.font = { size: 15, bold: true };
      // cellValue.font = { size: 15, bold: true };
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
