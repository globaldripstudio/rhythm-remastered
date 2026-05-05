// Demucs stem-separation processor wrapper.
// Lazily loads onnxruntime-web + demucs-web only when the user actually starts a job,
// so the heavy WASM assets are not pulled into the main bundle.

export type StemName = "drums" | "bass" | "other" | "vocals";
export type StemBuffers = Record<StemName, { left: Float32Array; right: Float32Array }>;

export interface ProcessorCallbacks {
  onDownloadProgress?: (loaded: number, total: number) => void;
  onProgress?: (info: { progress: number; currentSegment: number; totalSegments: number }) => void;
  onLog?: (phase: string, message: string) => void;
}

export interface DemucsRunner {
  backend: "webgpu" | "wasm";
  separate: (left: Float32Array, right: Float32Array) => Promise<StemBuffers>;
}

export async function detectBackend(): Promise<"webgpu" | "wasm"> {
  if (typeof navigator !== "undefined" && "gpu" in navigator) {
    try {
      const adapter = await (navigator as Navigator & {
        gpu?: { requestAdapter: () => Promise<unknown> };
      }).gpu!.requestAdapter();
      if (adapter) return "webgpu";
    } catch {
      // fall through
    }
  }
  return "wasm";
}

export async function createDemucs(callbacks: ProcessorCallbacks = {}): Promise<DemucsRunner> {
  const ort = await import("onnxruntime-web");
  const demucsModule = await import("demucs-web");
  const DemucsProcessor = (demucsModule as unknown as {
    DemucsProcessor: new (opts: Record<string, unknown>) => {
      loadModel: (url: string) => Promise<void>;
      separate: (l: Float32Array, r: Float32Array) => Promise<StemBuffers>;
    };
  }).DemucsProcessor;
  const CONSTANTS = (demucsModule as unknown as { CONSTANTS: { DEFAULT_MODEL_URL: string } }).CONSTANTS;

  // Configure ORT
  try {
    (ort as unknown as { env: { wasm: { numThreads: number } } }).env.wasm.numThreads =
      navigator.hardwareConcurrency || 4;
  } catch {
    /* ignore */
  }

  const backend = await detectBackend();
  if (backend === "webgpu") {
    try {
      (ort as unknown as { env: { webgpu?: { powerPreference: string } } }).env.webgpu = {
        powerPreference: "high-performance",
      };
    } catch {
      /* ignore */
    }
  }

  const sessionOptions: Record<string, unknown> = {
    enableCpuMemArena: false,
    enableMemPattern: false,
    executionProviders: backend === "webgpu" ? ["webgpu", "wasm"] : ["wasm"],
  };

  const processor = new DemucsProcessor({
    ort,
    sessionOptions,
    onDownloadProgress: callbacks.onDownloadProgress,
    onProgress: callbacks.onProgress,
    onLog: callbacks.onLog,
  });

  await processor.loadModel(CONSTANTS.DEFAULT_MODEL_URL);

  return {
    backend,
    separate: (l, r) => processor.separate(l, r),
  };
}

export async function decodeAudioFile(file: File, sampleRate = 44100): Promise<{
  left: Float32Array;
  right: Float32Array;
  duration: number;
}> {
  const arrayBuffer = await file.arrayBuffer();
  const Ctx = (window.AudioContext ||
    (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
  const offline = new Ctx({ sampleRate });
  const audioBuffer = await offline.decodeAudioData(arrayBuffer.slice(0));
  await offline.close?.();
  const left = audioBuffer.getChannelData(0);
  const right = audioBuffer.numberOfChannels > 1 ? audioBuffer.getChannelData(1) : left;
  return {
    left: new Float32Array(left),
    right: new Float32Array(right),
    duration: audioBuffer.duration,
  };
}
