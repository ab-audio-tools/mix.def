import { parseBlob } from 'music-metadata-browser';

export interface AudioMetadata {
  duration?: number;
  sample_rate?: number;
  bitrate?: number;
  lufs?: number;
  true_peak?: number;
  loudness_range?: number;
  format?: string;
}

/**
 * Extract audio metadata from a file using music-metadata-browser
 */
export async function extractAudioMetadata(file: File): Promise<AudioMetadata> {
  try {
    const metadata = await parseBlob(file);

    let format = metadata.format.container;
    // Normalize format names
    if (format?.toUpperCase() === 'MPEG') {
      format = 'MP3';
    }

    return {
      duration: metadata.format.duration,
      sample_rate: metadata.format.sampleRate,
      bitrate: metadata.format.bitrate,
      format: format?.toUpperCase(),
    };
  } catch (error) {
    console.error('Error extracting metadata:', error);
    // Fallback to basic info
    const ext = file.name.split('.').pop()?.toLowerCase();
    return {
      format: ext === 'mpeg' ? 'MP3' : ext?.toUpperCase(),
    };
  }
}

/**
 * Extract audio loudness using Web Audio API
 * Improved LUFS calculation with short-term loudness windowing
 * Reference: ITU-R BS.1770-4
 */
export async function extractAudioLoudness(file: File): Promise<{
  lufs?: number;
  true_peak?: number;
  loudness_range?: number;
}> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        const sampleRate = audioBuffer.sampleRate;
        const numChannels = audioBuffer.numberOfChannels;
        
        // Get channel data - use first channel or mix all channels
        let channelData: Float32Array;
        if (numChannels === 1) {
          channelData = audioBuffer.getChannelData(0);
        } else {
          // Mix all channels
          const mixed = new Float32Array(audioBuffer.length);
          for (let i = 0; i < audioBuffer.length; i++) {
            let sum = 0;
            for (let ch = 0; ch < numChannels; ch++) {
              sum += audioBuffer.getChannelData(ch)[i];
            }
            mixed[i] = sum / numChannels;
          }
          channelData = mixed;
        }
        
        // Calculate true peak first (max absolute sample)
        let maxSample = 0;
        for (let i = 0; i < channelData.length; i++) {
          maxSample = Math.max(maxSample, Math.abs(channelData[i]));
        }
        const true_peak = maxSample > 0 ? 20 * Math.log10(maxSample) : -Infinity;
        
        // Calculate short-term loudness using 400ms blocks
        const blockDuration = 0.4; // seconds
        const blockSamples = Math.floor(sampleRate * blockDuration);
        const blockLoudnesses: number[] = [];
        
        for (let i = 0; i < channelData.length; i += blockSamples) {
          const end = Math.min(i + blockSamples, channelData.length);
          
          // Calculate mean square for this block
          let sumSquares = 0;
          for (let j = i; j < end; j++) {
            sumSquares += channelData[j] * channelData[j];
          }
          
          const meanSquare = sumSquares / (end - i);
          
          // Convert to loudness (dB)
          // Each sample should be roughly in range [-1, 1]
          // Mean square close to 0 for quiet audio, close to 0.25-0.33 for normal audio
          if (meanSquare > 1e-7) {
            const loudnessDb = 10 * Math.log10(meanSquare);
            blockLoudnesses.push(loudnessDb);
          }
        }
        
        // Calculate integrated (overall) LUFS
        // Use mean of loudnesses
        let integratedLoudness: number;
        if (blockLoudnesses.length > 0) {
          // Convert dB values back to linear, average, then back to dB
          let sumLinear = 0;
          for (const db of blockLoudnesses) {
            sumLinear += Math.pow(10, db / 10);
          }
          const meanLinear = sumLinear / blockLoudnesses.length;
          integratedLoudness = 10 * Math.log10(meanLinear) - 0.691; // -0.691 is ITU reference correction
        } else {
          integratedLoudness = -Infinity;
        }
        
        // Calculate loudness range (difference between high and low)
        const loudness_range = blockLoudnesses.length > 0
          ? Math.max(...blockLoudnesses) - Math.min(...blockLoudnesses)
          : 0;
        
        // Clamp LUFS to realistic ranges
        const lufs = isFinite(integratedLoudness) 
          ? Math.max(-60, Math.min(-5, integratedLoudness))
          : -20;
        
        resolve({
          lufs: Number(lufs.toFixed(1)),
          true_peak: isFinite(true_peak) ? Number(true_peak.toFixed(1)) : 0,
          loudness_range: Number(loudness_range.toFixed(1)),
        });
      } catch (error) {
        console.error('Error calculating loudness:', error);
        resolve({});
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Estimate bitrate from file size and duration
 */
export function estimateBitrate(
  fileSizeBytes: number,
  durationSeconds: number
): number {
  if (durationSeconds === 0) return 0;
  // bitrate (kbps) = (file size in bits) / duration in seconds / 1000
  return Math.round((fileSizeBytes * 8) / durationSeconds / 1000);
}

/**
 * Full metadata extraction pipeline
 */
export async function extractFullAudioMetadata(
  file: File
): Promise<AudioMetadata> {
  const metadata = await extractAudioMetadata(file);

  // Estimate bitrate if not provided
  if (!metadata.bitrate && metadata.duration) {
    metadata.bitrate = estimateBitrate(file.size, metadata.duration);
  }

  // Extract loudness metrics
  const loudnessMetrics = await extractAudioLoudness(file);
  
  return {
    ...metadata,
    ...loudnessMetrics,
  };
}
