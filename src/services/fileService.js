const path = require("path");
const Image = require("../models/images");
const fs = require("fs");
const ImageFeedback = require("../models/image_feedback");
const OrderFeedback = require("../models/image_order");
const ImageOrder = require("../models/image_order");
const uploadMultipleFiles = async (fileArr, id) => {
  try {
    let uploadPath = path.resolve(__dirname, "../public/images/upload/" + id);

    if (fs.existsSync(uploadPath)) {
      await fs.promises.rm(uploadPath, { recursive: true, force: true });
    }
    await fs.promises.mkdir(uploadPath, { recursive: true });



    let resultArr = [];
    let countSuccess = 0;
    for (let i = 0; i < fileArr.length; i++) {
      //get name extension
      // console.log(fileArr[i])
      let extname = path.extname(fileArr[i].name);
      //get img's name without extension
      // let baseName = path.basename(fileArr[i].name, extname);

      img = await Image.create({
        file_extension: extname,
        product_id: id,
      });

      // if (type === 'shirt') {
      //   img = await Image.create({
      //     file_extension: extname,
      //     tshirt_id: id,
      //   });
      // } else if (type === 'pant') {
      //   img = await Image.create({
      //     file_extension: extname,
      //     pant_id: id,
      //   });
      // } else if (type === 'shoes') {
      //   img = await Image.create({
      //     file_extension: extname,
      //     shoes_id: id,
      //   });
      // } else if (type === 'accessory') {
      //   img = await Image.create({
      //     file_extension: extname,
      //     accessory_id: id,
      //   });
      // }

      // console.log(img);

      //create final path
      // let finalName = `${baseName}-${Date.now()}${extname}`;
      // let finalPath = `${uploadPath}/${finalName}`;

      let finalName = `${img._id}${extname}`;
      let finalPath = `${uploadPath}/${finalName}`;

      try {
        await fileArr[i].mv(finalPath);
        resultArr.push({
          status: "success",
          path: finalName,
          originalName: fileArr[i].name,
          extname,
          name: img._id,
          error: null,
        });
        countSuccess++;
      } catch (err) {
        console.log(err);
        resultArr.push({
          status: "failed",
          path: null,
          fileName: fileArr[i].name,
          error: JSON.stringify(err),
        });
      }
    }
    return {
      countSuccess: countSuccess,
      detail: resultArr,
    };
  } catch (error) {
    console.log(error);
  }
};

const uploadFeedbackImages = async (fileArr, id) => {
  try {
    let uploadPath = path.resolve(__dirname, "../public/images/feedback/" + id);
    // if (!fs.existsSync(uploadPath)) {
    //   fs.mkdirSync(uploadPath, { recursive: true });
    // }

    if (fs.existsSync(uploadPath)) {
      await fs.promises.rm(uploadPath, { recursive: true, force: true });
    }
    await fs.promises.mkdir(uploadPath, { recursive: true });
    await ImageFeedback.deleteMany({ feedback_id: id });

    let resultArr = [];
    let countSuccess = 0;
    for (let i = 0; i < fileArr.length; i++) {
      //get name extension
      // console.log(fileArr[i])
      let extname = path.extname(fileArr[i].name);
      //get img's name without extension
      // let baseName = path.basename(fileArr[i].name, extname);
      img = await ImageFeedback.create({
        file_extension: extname,
        feedback_id: id,
      });
      let finalName = `${img._id}${extname}`;
      let finalPath = `${uploadPath}/${finalName}`;

      await fileArr[i].mv(finalPath);
      resultArr.push({
        status: "success",
        path: finalName,
        originalName: fileArr[i].name,
        extname,
        name: img._id,
        error: null,
      });
      countSuccess++;
    }
    return {
      countSuccess: countSuccess,
      detail: resultArr,
    };
  } catch (error) {
    console.log(error);
  }
};
const uploadOrderImages = async (fileArr, id) => {
  try {
    let uploadPath = path.resolve(__dirname, "../public/images/order/" + id);
    // if (!fs.existsSync(uploadPath)) {
    //   fs.mkdirSync(uploadPath, { recursive: true });
    // }

    if (fs.existsSync(uploadPath)) {
      await fs.promises.rm(uploadPath, { recursive: true, force: true });
    }
    await fs.promises.mkdir(uploadPath, { recursive: true });
    await ImageOrder.deleteMany({ order_id: id });

    let resultArr = [];
    let countSuccess = 0;
    for (let i = 0; i < fileArr.length; i++) {
      //get name extension
      // console.log(fileArr[i])
      let extname = path.extname(fileArr[i].name);
      //get img's name without extension
      // let baseName = path.basename(fileArr[i].name, extname);
      img = await ImageOrder.create({
        file_extension: extname,
        order_id: id,
      });
      let finalName = `${img._id}${extname}`;
      let finalPath = `${uploadPath}/${finalName}`;

      await fileArr[i].mv(finalPath);
      resultArr.push({
        status: "success",
        path: finalName,
        originalName: fileArr[i].name,
        extname,
        name: img._id,
        error: null,
      });
      countSuccess++;
    }
    return {
      countSuccess: countSuccess,
      detail: resultArr,
    };
  } catch (error) {
    console.log(error);
  }
};
module.exports = {
  uploadMultipleFiles,
  uploadFeedbackImages,
  uploadOrderImages,
};
