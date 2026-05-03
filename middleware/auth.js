import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  const authheader = req.headers["authorization"];
  const token = authheader && authheader.split(" ")[1];

  if (!token)
    return res.status(401).json({ error: "Akses ditolak! Anda belum login." });

  jwt.verify(token, process.env.jwt_secret, (err, user) => {
    if (err)
      // Ubah 403 menjadi 401 agar frontend lebih mudah menangkapnya sebagai sesi habis
      return res.status(401).json({
        error: "Sesi login Anda telah berakhir. Silakan login kembali.",
      });
    req.user = user;
    next();
  });

  // jwt.verify(token, process.env.jwt_secret, (err, user) => {
  //   if (err)
  //     return res.status(403).json({
  //       error:
  //         "Token tidak valid atau Sesi login Anda telah berakhir. Silakan login kembali.. (F5)",
  //     });
  //   req.user = user;
  //   next();
  // });
};

// Middleware untuk memeriksa izin
// middleware/auth.js

export const authorizeRole = (allowedGroupIds) => {
  // 'allowedGroupIds' harus didefinisikan sebagai parameter di sini
  return (req, res, next) => {
    // TAMBAHKAN LOG INI
    // console.log("DEBUG: User dari Token:", req.user);

    // Pastikan req.user sudah ada
    if (!req.user) {
      return res.status(401).json({ error: "User tidak terautentikasi" });
    }

    const userGroupId = Number(req.user.user_group_id);

    // TAMBAHKAN LOG INI
    // console.log("DEBUG: Perbandingan Role:");
    // console.log("User Group ID:", userGroupId);
    // console.log("Diizinkan (allowedGroupIds):", allowedGroupIds);
    // console.log("Apakah diizinkan?:", allowedGroupIds.includes(userGroupId));

    // Sekarang allowedGroupIds dapat diakses di dalam sini
    if (!allowedGroupIds.includes(userGroupId)) {
      return res
        .status(403)
        .json({ error: "Akses ditolak: Anda tidak memiliki izin." });
    }

    next();
  };
};
