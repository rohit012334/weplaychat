const Gift = require("../../models/gift.model");
const GiftCategory = require("../../models/giftCategory.model");

//fs
const fs = require("fs");

//deletefile
const { deleteFiles } = require("../../util/deletefile");

//create gift
exports.addGift = async (req, res) => {
  try {
    const { type, name, giftCategoryId, coin } = req.body;

    const giftData = {
      type,
      name,
      giftCategoryId,
      coin,
    };

    if (req.files?.image) {
      giftData.image = req.files.image[0].path;
    }

    if (req.files?.svgaImage) {
      giftData.svgaImage = req.files.svgaImage[0].path;
      giftData.image = req.files.svgaImage[0].path;
    }

    if (req.files?.mp4Image) {
      giftData.mp4Image = req.files.mp4Image[0].path;
      giftData.image = req.files.mp4Image[0].path;
    }

    if (req.files?.webpImage) {
      giftData.webpImage = req.files.webpImage[0].path;
      giftData.image = req.files.webpImage[0].path;
    }

    const gift = new Gift(giftData);
    await gift.save();

    return res.status(200).json({
      status: true,
      message: "Gift created successfully",
      data: gift,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

//update gift
exports.modifyGift = async (req, res, next) => {
  try {
    const { giftId } = req.query;
    const { giftCategoryId, name } = req.body;
    console.log(req.body);
    if (!giftId) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "giftId must be required." });
    }

    const [gift, giftCategory] = await Promise.all([
      Gift.findById(giftId).select("_id giftCategoryId type name coin image svgaImage mp4Image webpImage"),
      giftCategoryId ? GiftCategory.findById(giftCategoryId).select("_id name") : null,
    ]);

    if (!gift) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "gift does not found." });
    }

    if (giftCategoryId && !giftCategory) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "GiftCategory does not found." });
    }

    gift.type = req.body.type ? req.body.type : gift.type;
    gift.name = name ? name : gift.name;
    gift.coin = req.body.coin ? req.body.coin : gift.coin;
    gift.giftCategoryId = req.body.giftCategoryId ? req.body.giftCategoryId : gift.giftCategoryId;

    if (req.files.image) {
      if (gift.image) {
        const image = gift?.image?.split("storage");
        if (image) {
          if (fs.existsSync("storage" + image[1])) {
            fs.unlinkSync("storage" + image[1]);
          }
        }
      }

      gift.image = req.files.image ? req.files.image[0].path : gift.image;
    }

    if (req.body.type == 3 && req.files.svgaImage) {
      if (gift.svgaImage) {
        const svgaImage = gift?.svgaImage?.split("storage");
        if (svgaImage) {
          if (fs.existsSync("storage" + svgaImage[1])) {
            fs.unlinkSync("storage" + svgaImage[1]);
          }
        }
      }

      gift.svgaImage = req.files.svgaImage ? req.files.svgaImage[0].path : gift.svgaImage;
      gift.image = req.files.svgaImage ? req.files.svgaImage[0].path : gift.svgaImage;

    }

    if (req.body.type == 4 && req.files.mp4Image) {
      if (gift.mp4Image) {
        const mp4Image = gift?.mp4Image?.split("storage");
        if (mp4Image) {
          if (fs.existsSync("storage" + mp4Image[1])) {
            fs.unlinkSync("storage" + mp4Image[1]);
          }
        }
      }

      gift.mp4Image = req.files.mp4Image ? req.files.mp4Image[0].path : gift.mp4Image;
      gift.image = req.files.mp4Image ? req.files.mp4Image[0].path : gift.mp4Image;

    }

    if (req.body.type == 5 && req.files.webpImage) {
      if (gift.webpImage) {
        const webpImage = gift?.webpImage?.split("storage");
        if (webpImage) {
          if (fs.existsSync("storage" + webpImage[1])) {
            fs.unlinkSync("storage" + webpImage[1]);
          }
        }
      }

      gift.webpImage = req.files.webpImage ? req.files.webpImage[0].path : gift.webpImage;
      gift.image = req.files.webpImage ? req.files.webpImage[0].path : gift.webpImage;
    }

    await gift.save();

    return res.status(200).json({ status: true, message: "Gift has been updated by the admin.", data: { ...gift.toObject(), giftCategory } });
  } catch (error) {
    if (req.files) deleteFiles(req.files);
    console.log(error);
    return res.status(200).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//get gifts
exports.retrieveGifts = async (req, res, next) => {
  try {
    const gift = await Gift.aggregate([
      {
        $match: { isDelete: false },
      },

      // ✅ sort before grouping
      {
        $sort: { createdAt: -1 },
      },

      {
        $lookup: {
          from: "giftcategories",
          localField: "giftCategoryId",
          foreignField: "_id",
          as: "category",
        },
      },

      {
        $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $group: {
          _id: "$giftCategoryId",
          categoryName: { $first: "$category.name" },
          gifts: {
            $push: {
              _id: "$_id",
              type: "$type",
              name: "$name",
              image: "$image",
              svgaImage: "$svgaImage",
              mp4Image: "$mp4Image",
              webpImage: "$webpImage",
              coin: "$coin",
              createdAt: "$createdAt",
            },
          },
        },
      },
    ]);

    return res.status(200).json({
      status: true,
      message: "Retrieve gifts for admin",
      data: gift,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//delete gift
exports.discardGift = async (req, res, next) => {
  try {
    const { giftId } = req.query;

    if (!giftId) {
      return res.status(200).json({ status: false, message: "giftId must be required." });
    }

    const gift = await Gift.findById(giftId).select("_id").lean();
    if (!gift) {
      return res.status(200).json({ status: false, message: "Gift does not exist." });
    }

    res.status(200).json({ status: true, message: "Gift has been marked as deleted by the admin." });

    //await Gift.findByIdAndUpdate(giftId, { isDelete: true });
    await Gift.findByIdAndDelete(giftId);
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};
