# Project Architecture Rules

- AI Song Checker must display a sample rate only when it is certified from the source container or consecutive audio-frame headers, because browser decoding may resample audio.
- AI Song Checker treats verified dates through 2020 as a high-confidence historical human classification, while preserving acoustic measurements for inspection.
- Re-encoding metadata is contextual only; AI scoring prioritizes corroborating acoustic markers that survive lossy conversion.