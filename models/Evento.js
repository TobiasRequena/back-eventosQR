import mongoose from "mongoose";

const eventoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  fechaInicio: { type: Date, required: true },
  descripcion: { type: String, default: "" },
  fechaFin: Date,
  lugar: String,
  creador: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true } // 🔥 nuevo campo
}, { timestamps: true });

export default mongoose.model("Evento", eventoSchema);
