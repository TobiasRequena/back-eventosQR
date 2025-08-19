import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from 'cors';

import Asistencia from "../models/Asistencia.js";
import Participante from "../models/Participante.js";
import Evento from "../models/Evento.js";

dotenv.config({ quiet: true });

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('[asistencia] Mongo conectado'))
  .catch(err => console.error('Mongo error:', err));

const app = express();
app.use(express.json());
app.use(cors());

// CRUD Asistencias
app.get("/", async (req, res) => {
    try {
        const asistencias = await Asistencia.find().populate("participanteId").populate("eventoId");
        res.json(asistencias);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/", async (req, res) => {
    try {
        const { participanteId, eventoId, estado } = req.body;
        if (!participanteId || !eventoId) {
            return res.status(400).json({ error: "participanteId y eventoId son requeridos" });
        }
        const asistencia = new Asistencia({ participanteId, eventoId, estado });
        await asistencia.save();
        res.status(201).json(asistencia);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/:id", async (req, res) => {
    try {
        const asistencia = await Asistencia.findById(req.params.id).populate("participanteId").populate("eventoId");
        if (!asistencia) return res.status(404).json({ error: "Asistencia no encontrada" });
        res.json(asistencia);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put("/:id", async (req, res) => {
    try {
        const asistencia = await Asistencia.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!asistencia) return res.status(404).json({ error: "Asistencia no encontrada" });
        res.json(asistencia);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete("/:id", async (req, res) => {
    try {
        const eliminado = await Asistencia.findByIdAndDelete(req.params.id);
        if (!eliminado) return res.status(404).json({ error: "Asistencia no encontrada" });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(5005, () => console.log("✅ Servicio Asistencia corriendo en puerto 5005"));
