import express from "express";
import cors from 'cors';
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
const PORT = 5000;

app.use(cors());


app.use("/auth", createProxyMiddleware({ target: "http://localhost:5001", changeOrigin: true }));
app.use("/talleres", createProxyMiddleware({ target: "http://localhost:5002", changeOrigin: true }));
app.use("/participantes", createProxyMiddleware({ target: "http://localhost:5003", changeOrigin: true }));
app.use("/eventos", createProxyMiddleware({ target: "http://localhost:5004", changeOrigin: true }));
app.use("/asistencia", createProxyMiddleware({ target: "http://localhost:5005", changeOrigin: true }));

app.listen(PORT, ()=> console.log(`🚀 Gateway corriendo en http://localhost:${PORT}`));
