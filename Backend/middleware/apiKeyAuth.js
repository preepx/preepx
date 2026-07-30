const requireApiKey = (req, res, next) => {
  const clientKey = req.headers['x-api-key'];
  const serverKey = process.env.API_SECRET_KEY || "PreepX_Secret_Key_12345";

  if (!clientKey || clientKey !== serverKey) {
    return res.status(403).json({ message: "Access Denied: Invalid or missing API Key" });
  }

  next();
};

module.exports = requireApiKey;
