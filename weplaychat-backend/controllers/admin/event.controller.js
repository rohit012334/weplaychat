const fs = require("fs");
const Event = require("../../models/Event.model");

const safeUnlink = (p) => {
  try {
    if (p && fs.existsSync(p)) fs.unlinkSync(p);
  } catch (_) {}
};

const removeStorageFileIfExists = (storedPath) => {
  if (!storedPath) return;
  const parts = storedPath.split("storage");
  if (parts.length > 1) {
    const diskPath = "storage" + parts[1];
    safeUnlink(diskPath);
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { link } = req.body;

    if (!req.file || !link) {
      if (req.file) safeUnlink(req.file.path);
      return res.status(200).json({ status: false, message: "Image and link are required." });
    }

    const event = await Event.create({
      image: req.file.path,
      link: link.toString(),
    });

    return res.status(200).json({
      status: true,
      message: "Event created successfully.",
      data: event,
    });
  } catch (error) {
    if (req.file) safeUnlink(req.file.path);
    console.error("createEvent error:", error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { eventId } = req.query;
    const { link } = req.body;

    if (!eventId) {
      if (req.file) safeUnlink(req.file.path);
      return res.status(200).json({ status: false, message: "eventId is required." });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      if (req.file) safeUnlink(req.file.path);
      return res.status(200).json({ status: false, message: "Event not found." });
    }

    if (typeof link === "string") event.link = link;

    if (req.file) {
      removeStorageFileIfExists(event.image);
      event.image = req.file.path;
    }

    await event.save();

    return res.status(200).json({
      status: true,
      message: "Event updated successfully.",
      data: event,
    });
  } catch (error) {
    if (req.file) safeUnlink(req.file.path);
    console.error("updateEvent error:", error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

exports.listEvents = async (req, res) => {
  try {
    const start = parseInt(req.query.start) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (start - 1) * limit;

    const [events, total] = await Promise.all([
      Event.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Event.countDocuments(),
    ]);

    return res.status(200).json({
      status: true,
      message: "Events fetched successfully.",
      data: events,
      total,
    });
  } catch (error) {
    console.error("listEvents error:", error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.query;
    if (!eventId) return res.status(200).json({ status: false, message: "eventId is required." });

    const event = await Event.findById(eventId);
    if (!event) return res.status(200).json({ status: false, message: "Event not found." });

    removeStorageFileIfExists(event.image);
    await Event.findByIdAndDelete(eventId);

    return res.status(200).json({ status: true, message: "Event deleted successfully." });
  } catch (error) {
    console.error("deleteEvent error:", error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

exports.updateEventStatus = async (req, res) => {
  try {
    const { eventId } = req.query;
    if (!eventId) return res.status(200).json({ status: false, message: "eventId is required." });

    const event = await Event.findById(eventId);
    if (!event) return res.status(200).json({ status: false, message: "Event not found." });

    event.isActive = !event.isActive;
    await event.save();

    return res.status(200).json({
      status: true,
      message: event.isActive ? "Event activated." : "Event deactivated.",
      data: event,
    });
  } catch (error) {
    console.error("updateEventStatus error:", error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

