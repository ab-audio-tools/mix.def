/**
 * Format file size to human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format duration from seconds to MM:SS format
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format count to shortened format (K, M, etc.)
 */
export function formatCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

/**
 * Validate audio file
 */
export function validateAudioFile(file: File): { valid: boolean; error?: string } {
  const validMimeTypes = [
    'audio/mpeg',
    'audio/wav',
    'audio/mp4',
    'audio/ogg',
    'audio/flac',
    'audio/aac',
  ];

  const maxFileSize = 100 * 1024 * 1024; // 100MB

  if (!validMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file format. Please upload MP3, WAV, or other supported audio formats.',
    };
  }

  if (file.size > maxFileSize) {
    return {
      valid: false,
      error: 'File size exceeds 100MB limit.',
    };
  }

  return { valid: true };
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  if (!validMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid image format. Please upload JPEG, PNG, WebP, or GIF.',
    };
  }

  if (file.size > maxFileSize) {
    return {
      valid: false,
      error: 'Image size exceeds 10MB limit.',
    };
  }

  return { valid: true };
}

/**
 * Get audio duration from file
 */
export async function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      audioContext.decodeAudioData(
        e.target?.result as ArrayBuffer,
        (buffer) => {
          resolve(buffer.duration);
        },
        (error) => {
          reject(error);
        }
      );
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Generate slug from string
 */
export function generateSlug(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(user: any): boolean {
  return !!user && !!user.id;
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}
