import mongoose from "mongoose";

const tallerSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: String,
  cupo: { type: Number, default: 0 },

  // relación con Evento
  evento: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Evento",
    required: true
  },

  // relación con Usuario (guardamos objeto completo en este caso)
  creador: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
    nombre: String,
    email: String,
    rol: String
  }

}, { timestamps: true });

export default mongoose.model("Taller", tallerSchema);
