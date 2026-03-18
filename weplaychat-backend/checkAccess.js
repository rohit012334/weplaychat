module.exports = () => {
  return (req, res, next) => {
    const key = req.headers.key || req.body.key || req.query.key;

    if (key) {
      if (key === process.env?.secretKey) {
        next();
      } else {
        console.warn(`⚠️ [AUTH] Invalid key received: ${key}`);
        return res.status(400).json({ status: false, error: "Unpermitted infiltration (Invalid Key)" });
      }
    } else {
      console.warn("⚠️ [AUTH] No key received in headers/body/query.");
      return res.status(400).json({ status: false, error: "Unpermitted infiltration (Missing Key)" });
    }
  };
};
