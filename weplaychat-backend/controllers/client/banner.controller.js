const Banner = require("../../models/Banner.model");
const fs = require("fs");

//create new banner
exports.createBanner = async (req, res) => {
  try {
    const { title, link, isActive } = req.body;

    const imagePath = req.file
      ? req.file.path.replace(/\\/g, "/")   // 🔥 convert \ to /
      : "";

    const banner = new Banner({
      title: title || "",
      link: link || "",
      image: imagePath,
      isActive: typeof isActive !== "undefined" ? isActive : true,
    });

    await banner.save();

    return res.status(200).json({
      status: true,
      message: "Banner created successfully.",
      data: banner,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//update existing banner
exports.updateBanner = async (req, res) => {
  try {
    const { bannerId, title, link, isActive } = req.body;

    if (!bannerId) {
      return res.status(200).json({ status: false, message: "bannerId is required." });
    }

    const banner = await Banner.findById(bannerId);
    if (!banner) {
      return res.status(200).json({ status: false, message: "Banner not found." });
    }

    //replace image if new one provided
    if (req.file) {
      if (banner.image) {
        const imagePath = banner.image.includes("storage") ? "storage" + banner.image.split("storage")[1] : "";
        if (imagePath && fs.existsSync(imagePath)) {
          const imageName = imagePath.split("/").pop();
          if (!["male.png", "female.png"].includes(imageName)) {
            fs.unlinkSync(imagePath);
          }
        }
      }
      banner.image = req.file.path;
    }

    banner.title = typeof title !== "undefined" ? title : banner.title;
    banner.link = typeof link !== "undefined" ? link : banner.link;
    banner.isActive = typeof isActive !== "undefined" ? isActive : banner.isActive;

    await banner.save();

    return res.status(200).json({
      status: true,
      message: "Banner updated successfully.",
      data: banner,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//toggle isActive
exports.updateBannerStatus = async (req, res) => {
  try {
    const { bannerId } = req.query;
    if (!bannerId) {
      return res.status(200).json({ status: false, message: "bannerId is required." });
    }

    const banner = await Banner.findById(bannerId);
    if (!banner) {
      return res.status(200).json({ status: false, message: "Banner not found." });
    }

    banner.isActive = !banner.isActive;
    await banner.save();

    return res.status(200).json({
      status: true,
      message: "Banner status updated successfully.",
      data: banner,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//list banners with pagination
exports.getAllBanners = async (req, res) => {
  try {
    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    const [total, banners] = await Promise.all([
      Banner.countDocuments({ isDelete: false }),
      Banner.find({ isDelete: false })
        .sort({ createdAt: -1 })
        .skip((start - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    return res.status(200).json({
      status: true,
      message: "Banners retrieved successfully.",
      total,
      data: banners,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//retrieve single banner details
exports.getBannerDetails = async (req, res) => {
  try {
    const { bannerId } = req.query;
    if (!bannerId) {
      return res.status(200).json({ status: false, message: "bannerId is required." });
    }

    const banner = await Banner.findById(bannerId).lean();
    if (!banner) {
      return res.status(200).json({ status: false, message: "Banner not found." });
    }

    return res.status(200).json({ status: true, message: "Success", data: banner });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//return only active banners for client listing
exports.fetchBannerList = async (req, res) => {
  try {
    const banners = await Banner.find({ isDelete: false, isActive: true }).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ status: true, message: "Success", data: banners });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//delete banner permanently
exports.deleteBanner = async (req, res) => {
  try {
    const { bannerId } = req.query;
    if (!bannerId) {
      return res.status(200).json({ status: false, message: "bannerId is required." });
    }

    const banner = await Banner.findById(bannerId).select("_id image");
    if (!banner) {
      return res.status(200).json({ status: false, message: "Banner not found." });
    }

    res.status(200).json({ status: true, message: "Banner deleted successfully." });

    if (banner.image) {
      const imagePath = banner.image.includes("storage") ? "storage" + banner.image.split("storage")[1] : "";
      if (imagePath && fs.existsSync(imagePath)) {
        const imageName = imagePath.split("/").pop();
        if (!["male.png", "female.png"].includes(imageName)) {
          fs.unlinkSync(imagePath);
        }
      }
    }

    await Banner.findByIdAndDelete(bannerId);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};
