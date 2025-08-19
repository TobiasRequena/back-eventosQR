import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Taller from "../models/Taller.js";
import Evento from "../models/Evento.js";
import { authMiddleware } from "../middleware/auth.js";

dotenv.config({ quiet: true });

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('[talleres] Mongo conectado'))
  .catch(err => console.error('Mongo error:', err));

const app = express();
app.use(express.json());

// Obtener todos los talleres
app.get("/", async (req, res) => {
  try {
    const talleres = await Taller.find().populate("evento");
    res.json(talleres);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear un taller
app.post("/", authMiddleware, async (req, res) => {
  try {
    const { nombre, descripcion, cupo, eventoId } = req.body;

    if (!nombre || !eventoId) {
      return res.status(400).json({ error: "nombre y eventoId son requeridos" });
    }

    const evento = await Evento.findById(eventoId);
    if (!evento) {
      return res.status(404).json({ error: "Evento no encontrado" });
    }

    const nuevoTaller = new Taller({
      nombre,
      descripcion,
      cupo,
      evento: evento._id,
      creador: {
        _id: req.user.id,
        nombre: req.user.nombre,
        email: req.user.email,
        rol: req.user.rol
      }
    });

    await nuevoTaller.save();
    res.status(201).json(nuevoTaller);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener taller por id
app.get("/:id", async (req, res) => {
  try {
    const taller = await Taller.findById(req.params.id).populate("evento");
    if (!taller) return res.status(404).json({ error: "Taller no encontrado" });
    res.json(taller);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar taller
app.put("/:id", authMiddleware, async (req, res) => {
  try {
    const taller = await Taller.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!taller) return res.status(404).json({ error: "Taller no encontrado" });
    res.json(taller);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar taller
app.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const eliminado = await Taller.findByIdAndDelete(req.params.id);
    if (!eliminado) return res.status(404).json({ error: "Taller no encontrado" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5002, () => console.log("📚 Servicio Talleres corriendo en puerto 5002"));
