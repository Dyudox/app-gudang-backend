import jwt from "jsonwebtoken";

const authenticatetoken = (req, res, next) => {
  const authheader = req.headers["authorization"];
  const token = authheader && authheader.split(" ")[1];

  if (!token)
    return res.status(401).json({ error: "Akses ditolak! Anda belum login." });

  jwt.verify(token, process.env.jwt_secret, (err, user) => {
    if (err)
      return res.status(403).json({
        error:
          "Token tidak valid atau Sesi login Anda telah berakhir. Silakan login kembali.. (F5)",
      });
    req.user = user;
    next();
  });
};

export default authenticatetoken;
