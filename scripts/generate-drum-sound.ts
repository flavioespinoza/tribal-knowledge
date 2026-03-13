/**
 * Generates a simple Indian drums WAV sound file.
 * Low-frequency sine wave with exponential decay to simulate a tabla/drum hit.
 * Run: npx tsx scripts/generate-drum-sound.ts
 */
import { writeFileSync, existsSync } from "node:fs";
import path from "node:path";

const OUTPUT = path.resolve(
  import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname),
  "..",
  "sounds",
  "indian_drums.wav"
);

function generateDrumWav(): Buffer {
  const sampleRate = 44100;
  const durationSec = 1.2;
  const numSamples = Math.floor(sampleRate * durationSec);
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = numSamples * blockAlign;

  const buf = Buffer.alloc(44 + dataSize);

  // WAV header
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16); // chunk size
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(numChannels, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(byteRate, 28);
  buf.writeUInt16LE(blockAlign, 32);
  buf.writeUInt16LE(bitsPerSample, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(dataSize, 40);

  // Generate two drum hits: a deep hit at t=0 and a lighter hit at t=0.4s
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;

    // Hit 1: deep drum (low freq ~80Hz, fast decay)
    if (t < 0.35) {
      const freq1 = 80 + 120 * Math.exp(-t * 15); // pitch drops from 200Hz to 80Hz
      const decay1 = Math.exp(-t * 8);
      sample += Math.sin(2 * Math.PI * freq1 * t) * decay1 * 0.7;
      // Add some noise for attack
      if (t < 0.01) {
        sample += (Math.random() * 2 - 1) * (1 - t / 0.01) * 0.3;
      }
    }

    // Hit 2: lighter drum at t=0.4s
    const t2 = t - 0.4;
    if (t2 > 0 && t2 < 0.3) {
      const freq2 = 120 + 100 * Math.exp(-t2 * 20);
      const decay2 = Math.exp(-t2 * 10);
      sample += Math.sin(2 * Math.PI * freq2 * t2) * decay2 * 0.5;
      if (t2 < 0.008) {
        sample += (Math.random() * 2 - 1) * (1 - t2 / 0.008) * 0.2;
      }
    }

    // Hit 3: deep drum at t=0.75s
    const t3 = t - 0.75;
    if (t3 > 0 && t3 < 0.35) {
      const freq3 = 90 + 110 * Math.exp(-t3 * 15);
      const decay3 = Math.exp(-t3 * 8);
      sample += Math.sin(2 * Math.PI * freq3 * t3) * decay3 * 0.6;
      if (t3 < 0.01) {
        sample += (Math.random() * 2 - 1) * (1 - t3 / 0.01) * 0.25;
      }
    }

    // Clamp and write 16-bit PCM
    sample = Math.max(-1, Math.min(1, sample));
    const int16 = Math.floor(sample * 32767);
    buf.writeInt16LE(int16, 44 + i * 2);
  }

  return buf;
}

if (!existsSync(OUTPUT)) {
  writeFileSync(OUTPUT, generateDrumWav());
  console.log(`[generate-drum-sound] Created: ${OUTPUT}`);
} else {
  console.log(`[generate-drum-sound] Already exists: ${OUTPUT}`);
}
