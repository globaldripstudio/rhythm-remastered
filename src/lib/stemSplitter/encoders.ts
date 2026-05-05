// WAV / MP3 encoders for Float32 PCM stems

export function encodeWav(left: Float32Array, right: Float32Array, sampleRate = 44100): Blob {
  const numChannels = 2;
  const bitsPerSample = 16;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;
  const numSamples = Math.min(left.length, right.length);
  const dataSize = numSamples * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };

  writeStr(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeStr(36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const l = Math.max(-1, Math.min(1, left[i]));
    const r = Math.max(-1, Math.min(1, right[i]));
    view.setInt16(offset, l < 0 ? l * 0x8000 : l * 0x7fff, true);
    view.setInt16(offset + 2, r < 0 ? r * 0x8000 : r * 0x7fff, true);
    offset += 4;
  }

  return new Blob([buffer], { type: "audio/wav" });
}

export async function encodeMp3(
  left: Float32Array,
  right: Float32Array,
  sampleRate = 44100,
  kbps = 320
): Promise<Blob> {
  const { Mp3Encoder } = await import("@breezystack/lamejs");
  const encoder = new Mp3Encoder(2, sampleRate, kbps);
  const numSamples = Math.min(left.length, right.length);
  // Convert Float32 [-1,1] → Int16
  const l16 = new Int16Array(numSamples);
  const r16 = new Int16Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const l = Math.max(-1, Math.min(1, left[i]));
    const r = Math.max(-1, Math.min(1, right[i]));
    l16[i] = l < 0 ? l * 0x8000 : l * 0x7fff;
    r16[i] = r < 0 ? r * 0x8000 : r * 0x7fff;
  }
  const blockSize = 1152;
  const chunks: Uint8Array[] = [];
  for (let i = 0; i < numSamples; i += blockSize) {
    const lc = l16.subarray(i, i + blockSize);
    const rc = r16.subarray(i, i + blockSize);
    const buf = encoder.encodeBuffer(lc, rc);
    if (buf.length > 0) chunks.push(buf);
  }
  const end = encoder.flush();
  if (end.length > 0) chunks.push(end);
  return new Blob(chunks as BlobPart[], { type: "audio/mpeg" });
}
