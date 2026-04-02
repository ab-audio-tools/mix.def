import { parseBlob } from 'music-metadata-browser';

export interface AudioMetadata {
  duration?: number;
  sample_rate?: number;
  bitrate?: number;
  lufs?: number;
  format?: string;
}

/**
 * Extract audio metadata from a file using music-metadata-browser
 */
export async function extractAudioMetadata(file: File): Promise<AudioMetadata> {
  try {
    const metadata = await parseBlob(file);

    return {
      duration: metadata.format.duration,
      sample_rate: metadata.format.sampleRate,
      bitrate: metadata.format.bitrate,
      format: metadata.format.container,
    };
  } catch (error) {
    console.error('Error extracting metadata:', error);
    // Fallback to basic info
    return {
      format: file.name.split('.').pop()?.toLowerCase(),
    };
  }
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

  return metadata;
}
