import mongoose from "mongoose";

const participanteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true },
  telefono: String,

  // Relaciones
  tallerId: { type: mongoose.Schema.Types.ObjectId, ref: "Taller", required: true },
  eventoId: { type: mongoose.Schema.Types.ObjectId, ref: "Evento", required: true },

  // QR generado
  qrCode: String,

  // Info de creación
  creadoEn: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("Participante", participanteSchema);
