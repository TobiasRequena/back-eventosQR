import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import QRCode from "qrcode";
import nodemailer from "nodemailer";

// Models
import Participante from "../models/Participante.js";
import Taller from "../models/Taller.js";
import Evento from "../models/Evento.js";

dotenv.config({ quiet: true });

// Configurar transporte de correo
const transporter = nodemailer.createTransport({
  service: "gmail", // Gmail en este caso
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('[participantes] Mongo conectado'))
  .catch(err => console.error('Mongo error:', err));

const app = express();
app.use(express.json());

// 📌 Crear participante
app.post("/", async (req, res) => {
  try {
    const { nombre, email, telefono, tallerId, eventoId } = req.body;

    if (!nombre || !email || !tallerId || !eventoId) {
      return res.status(400).json({ error: "nombre, email, tallerId y eventoId son requeridos" });
    }

    // Verificar que evento existe
    const evento = await Evento.findById(eventoId);
    if (!evento) return res.status(404).json({ error: "Evento no encontrado" });

    // Verificar que taller existe
    const taller = await Taller.findById(tallerId);
    if (!taller) return res.status(404).json({ error: "Taller no encontrado" });

    // Crear participante
    const participante = new Participante({ nombre, email, telefono, tallerId, eventoId });
    await participante.save();

    // Generar QR con datos completos
    const qrData = {
      participanteId: participante._id,
      nombre: participante.nombre,
      email: participante.email,
      telefono: participante.telefono,
      taller: {
        id: taller._id,
        nombre: taller.nombre,
        descripcion: taller.descripcion
      },
      evento: {
        id: evento._id,
        nombre: evento.nombre,
        fecha: evento.fecha
      }
    };

    const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrData));

    participante.qrCode = qrCodeImage;
    await participante.save();

    const participanteConDatos = await Participante.findById(participante._id)
      .populate("tallerId", "nombre descripcion")
      .populate("eventoId", "nombre fecha");

    // 📧 Enviar email con QR adjunto
    const mailOptions = {
      from: `"EventosQR" <${process.env.MAIL_USER}>`,
      to: email,
      subject: `🎟️ Tu entrada para el evento ${evento.nombre}`,
      html: `
        <p>Hola <b>${nombre}</b>,</p>
        <p>Tu inscripción al evento <b>${evento.nombre}</b> fue exitosa.</p>
        <p>Taller asignado: <b>${taller.nombre}</b></p>
        <p>Adjuntamos tu código QR, muéstralo en la entrada.</p>
      `,
      attachments: [
        {
          filename: `entrada_qr_${participante._id}.png`,
          content: qrCodeImage.split("base64,")[1],
          encoding: "base64"
        }
      ]
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ participanteConDatos, mensaje: "Participante creado y mail enviado" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 📌 Obtener todos
app.get("/", async (req, res) => {
  try {
    const participantes = await Participante.find()
      .populate("tallerId")
      .populate("eventoId");
    res.json(participantes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Obtener por id
app.get("/:id", async (req, res) => {
  try {
    const participante = await Participante.findById(req.params.id)
      .populate("tallerId")
      .populate("eventoId");
    if (!participante) return res.status(404).json({ error: "Participante no encontrado" });
    res.json(participante);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Actualizar
app.put("/:id", async (req, res) => {
  try {
    const participante = await Participante.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!participante) return res.status(404).json({ error: "Participante no encontrado" });
    res.json(participante);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Eliminar
app.delete("/:id", async (req, res) => {
  try {
    const eliminado = await Participante.findByIdAndDelete(req.params.id);
    if (!eliminado) return res.status(404).json({ error: "Participante no encontrado" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5003, () => console.log("👤 Servicio Participantes corriendo en puerto 5003"));
