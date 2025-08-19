import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

//models
import Usuario from "../models/Usuario.js";

dotenv.config({ quiet: true });

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('[login] Mongo conectado'))
  .catch(err => console.error('Mongo error:', err));

const app = express();
app.use(express.json());

// CRUD Usuarios
// Obtener todos los usuarios
app.get("/", async (req, res) => {
    try {
        const usuarios = await Usuario.find();
        res.json(usuarios);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Crear usuario
app.post("/", async (req, res) => {
    try {
        const { nombre, email, password, rol } = req.body;
        if (!nombre || !email || !password) {
            return res.status(400).json({ error: "nombre, email y password son requeridos" });
        }
        const existe = await Usuario.findOne({ email });
        if (existe) {
            return res.status(400).json({ error: "El email ya está registrado" });
        }
        const nuevoUsuario = new Usuario({ nombre, email, password, rol });
        await nuevoUsuario.save();
        res.status(201).json(nuevoUsuario);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login y emisión de token
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email y password requeridos" });
        }

        const usuario = await Usuario.findOne({ email });
        if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

        const esValido = await bcrypt.compare(password, usuario.password);
        if (!esValido) return res.status(401).json({ error: "Credenciales inválidas" });

        // generar token
        const token = jwt.sign(
            { id: usuario._id, email: usuario.email, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: "2h" } // ⏳ duración del token
        );

        res.json({ token, usuario: { id: usuario._id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Obtener usuario por id
app.get("/:id", async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.id);
        if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });
        res.json(usuario);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Actualizar usuario
app.put("/:id", async (req, res) => {
    try {
        const usuario = await Usuario.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });
        res.json(usuario);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Eliminar usuario
app.delete("/:id", async (req, res) => {
    try {
        const eliminado = await Usuario.findByIdAndDelete(req.params.id);
        if (!eliminado) return res.status(404).json({ error: "Usuario no encontrado" });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(5001, () => console.log("🔑 Servicio Login corriendo en puerto 5001"));
