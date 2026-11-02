import { API_URL } from '../constants/storageKeys';

export type ImageUrlOptions = {
  /** Max width in px (uses GET /api/media/image). */
  width?: number;
  quality?: number;
};

/**
 * Absolute URL for restaurant/product images.
 * Local /uploads/* paths can be resized via the media API.
 */
export function imageUrl(
  path: string | undefined | null,
  options?: ImageUrlOptions,
): string | undefined {
  if (!path) {
    return undefined;
  }

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const normalized = path.startsWith('/') ? path : `/${path}`;

  if (!options?.width) {
    return `${API_URL}${normalized}`;
  }

  const params = new URLSearchParams({
    path: normalized,
    w: String(Math.round(options.width)),
  });

  if (options.quality != null) {
    params.set('q', String(Math.round(options.quality)));
  }

  return `${API_URL}/api/media/image?${params.toString()}`;
}
