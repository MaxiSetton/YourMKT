// Finalizacion de audio: normaliza el reel a -14 LUFS (estandar de redes) con un toque de compresion.
// El video se copia tal cual (rapido). Salida: out/reel-final.mp4.
import { existsSync, readdirSync } from "node:fs";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const inFile = path.join(root, "out", "reel.mp4");
const outFile = path.join(root, "out", "reel-final.mp4");

// localizar ffmpeg en .tools (build estatico) o en el PATH
const toolsDir = path.join(root, ".tools");
let ffmpeg = "ffmpeg";
if (existsSync(toolsDir)) {
  for (const d of readdirSync(toolsDir)) {
    const cand = path.join(toolsDir, d, "bin", "ffmpeg.exe");
    if (existsSync(cand)) { ffmpeg = cand; break; }
  }
}

if (!existsSync(inFile)) {
  console.error("Falta out/reel.mp4 — corré render primero.");
  process.exit(1);
}

const args = [
  "-y", "-i", inFile,
  "-af", "acompressor=threshold=-18dB:ratio=3:attack=20:release=250,loudnorm=I=-14:TP=-1.5:LRA=11",
  "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-ar", "48000",
  outFile,
];

console.log(`> ffmpeg loudnorm -14 LUFS -> out/reel-final.mp4`);
const child = spawn(ffmpeg, args, { stdio: "inherit", shell: process.platform === "win32" });
child.on("exit", (code) => {
  if (code === 0) console.log(`\nlisto: ${outFile}`);
  process.exit(code ?? 1);
});
