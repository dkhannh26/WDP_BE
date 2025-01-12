const path = require("path");
const Image = require("../models/images");
const fs = require("fs");
const uploadMultipleFiles = async (fileArr, id, type) => {
  try {
    let uploadPath = path.resolve(
      __dirname,
      "../public/images/upload/" + id
    );
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    let resultArr = [];
    let countSuccess = 0;
    for (let i = 0; i < fileArr.length; i++) {
      //get name extension
      // console.log(fileArr[i])
      let extname = path.extname(fileArr[i].name);
      //get img's name without extension
      // let baseName = path.basename(fileArr[i].name, extname);

      if (type === 'shirt') {
        img = await Image.create({
          file_extension: extname,
          tshirt_id: id,
        });
      } else if (type === 'pant') {
        img = await Image.create({
          file_extension: extname,
          pant_id: id,
        });
      } else if (type === 'shoes') {
        img = await Image.create({
          file_extension: extname,
          shoes_id: id,
        });
      } else if (type === 'accessory') {
        img = await Image.create({
          file_extension: extname,
          accessory_id: id,
        });
      }

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

module.exports = {
  uploadMultipleFiles,
};
