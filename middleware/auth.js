import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // espera "Bearer <token>"
  if (!token) return res.status(401).json({ error: "Token requerido" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // acá queda el id del usuario
    next();
  } catch (err) {
    res.status(403).json({ error: "Token inválido" });
  }
};
