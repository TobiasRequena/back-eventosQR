import mongoose from "mongoose";

const asistenciaSchema = new mongoose.Schema({
  participanteId: { type: mongoose.Schema.Types.ObjectId, ref: "Participante" },
  eventoId: { type: mongoose.Schema.Types.ObjectId, ref: "Evento" },
  fechaHora: { type: Date, default: Date.now },
  estado: { type: String, enum: ["asistio","no_asistio"], default: "no_asistio" }
}, { timestamps: true });

export default mongoose.model("Asistencia", asistenciaSchema);
