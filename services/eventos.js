import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

//middleware
import { authMiddleware } from "../middleware/auth.js";

//models
import Evento from "../models/Evento.js";

dotenv.config({ quiet: true });

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('[eventos] Mongo conectado'))
  .catch(err => console.error('Mongo error:', err));

const app = express();
app.use(express.json());

// CRUD Eventos
app.get("/", async (req, res) => {
  try {
    const eventos = await Evento.find().populate("creador", "nombre email"); // populamos datos del creador
    res.json(eventos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST (requiere estar logueado)
app.post("/", authMiddleware, async (req, res) => {
  try {
    const { nombre, fechaInicio, fechaFin, lugar, descripcion } = req.body;
    if (!nombre || !fechaInicio) return res.status(400).json({ error: "nombre y fechaInicio son requeridos" });

    const evento = new Evento({
      nombre,
      fechaInicio,
      fechaFin,
      lugar,
      descripcion,
      creador: req.user // 🔥 viene del token
    });

    await evento.save();
    res.status(201).json(evento);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/:id", async (req, res) => {
    try {
        const evento = await Evento.findById(req.params.id);
        if (!evento) return res.status(404).json({ error: "Evento no encontrado" });
        res.json(evento);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put("/:id", async (req, res) => {
    try {
        const evento = await Evento.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!evento) return res.status(404).json({ error: "Evento no encontrado" });
        res.json(evento);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete("/:id", async (req, res) => {
    try {
        const eliminado = await Evento.findByIdAndDelete(req.params.id);
        if (!eliminado) return res.status(404).json({ error: "Evento no encontrado" });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(5004, () => console.log("🎉 Servicio Eventos corriendo en puerto 5004"));
