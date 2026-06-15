// Orquesta el render. Para cada escena resuelve la CADENA DE FUENTES contra lo que existe en public/
// (stand-in del pool de Supabase). La logica "lo que hay es lo que hay" vive aca, en Node.
import { existsSync, readdirSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const publicDir = path.join(root, "public");
const outDir = path.join(root, "out");
const specFile = process.argv[2] ?? "spec.promo.json";

// matchea por nombre sin importar la extension (bg.png en el spec -> bg.jpg en disco)
const publicFiles = existsSync(publicDir) ? readdirSync(publicDir) : [];
const stem = (f) => f.replace(/\.[^.]+$/, "").toLowerCase();
const resolveAsset = (name) => {
  if (!name) return null;
  if (publicFiles.includes(name)) return name;
  return publicFiles.find((f) => stem(f) === stem(name)) ?? null;
};
const VIDEO_EXT = ["mp4", "mov", "webm", "m4v"];
const isVideoFile = (f) => VIDEO_EXT.includes(f.split(".").pop().toLowerCase());

// Resuelve una escena: primera fuente de la cadena que exista gana; si ninguna, placeholder.
// (Futuro: asset_cliente -> match contra pool por descripcion; generadas -> llamar a HF.)
function resolverEscena(escena) {
  for (const f of escena.visual.fuentes) {
    const file = resolveAsset(f.archivo);
    if (file) {
      const video = isVideoFile(file);
      return {
        kind: video ? "video" : "image",
        src: file,
        fit: "cover",
        kenburns: f.tipo === "kenburns" && !video,
        intencion: escena.visual.intencion,
        via: `${f.tipo}:${file}`,
      };
    }
  }
  return { kind: "placeholder", intencion: escena.visual.intencion, via: "placeholder" };
}

const spec = JSON.parse(await readFile(path.join(root, specFile), "utf8"));

const resumen = [];
for (const escena of spec.escenas) {
  escena.resuelto = resolverEscena(escena);
  resumen.push(`${escena.rol}: ${escena.resuelto.kind}${escena.resuelto.src ? ` (${escena.resuelto.src})` : ""}`);
}

if (spec.audio.musica) {
  const m = resolveAsset(spec.audio.musica.src);
  spec.audio.musica.exists = Boolean(m);
  if (m) spec.audio.musica.src = m;
}
const voiceExists = existsSync(path.join(publicDir, "voice.mp3"));
const subs = existsSync(path.join(publicDir, "subs.json"))
  ? JSON.parse(await readFile(path.join(publicDir, "subs.json"), "utf8"))
  : [];

// rangos donde se oculta el subtitulo (escenas con tarjeta propia, ej. CTA)
const hideRanges = spec.escenas.filter((e) => e.ocultarSubtitulos).map((e) => [e.t_in, e.t_out]);

await mkdir(outDir, { recursive: true });
const propsPath = path.join(outDir, "props.json");
await writeFile(propsPath, JSON.stringify({ spec, subs, voiceExists, hideRanges }, null, 2));

console.log(`spec: ${specFile} (${spec.arquetipo}) | voz: ${voiceExists ? "ok" : "FALTA"} | subs: ${subs.length} | musica: ${spec.audio.musica?.exists ? "ok" : "falta"}`);
console.log("escenas ->", resumen.join("  |  "));

const outFile = path.join(outDir, "reel.mp4");
const args = ["render", "Reel", outFile, `--props=${propsPath}`];
const bin = path.join(root, "node_modules", ".bin", process.platform === "win32" ? "remotion.cmd" : "remotion");
console.log(`\n> remotion ${args.join(" ")}\n`);

const child = spawn(bin, args, { cwd: root, stdio: "inherit", shell: process.platform === "win32" });
child.on("exit", (code) => {
  if (code === 0) console.log(`\nlisto: ${outFile}`);
  process.exit(code ?? 1);
});
