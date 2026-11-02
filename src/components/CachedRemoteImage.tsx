import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, ImageErrorEventData, ImageProps } from 'expo-image';
import { imageUrl } from '../utils/imageUrl';

type Props = Omit<ImageProps, 'source'> & {
  path: string | undefined | null;
  width?: number;
  quality?: number;
};

/**
 * Loads resized image via /api/media/image; on failure falls back to full /uploads URL.
 */
export default function CachedRemoteImage({
  path,
  width,
  quality,
  onError,
  ...rest
}: Props) {
  const primaryUri = useMemo(
    () => (width ? imageUrl(path, { width, quality }) : imageUrl(path)),
    [path, width, quality],
  );
  const fallbackUri = useMemo(() => imageUrl(path), [path]);

  const [uri, setUri] = useState<string | undefined>(primaryUri);

  useEffect(() => {
    setUri(primaryUri);
  }, [primaryUri]);

  const handleError = useCallback(
    (e: ImageErrorEventData) => {
      if (fallbackUri && uri !== fallbackUri) {
        setUri(fallbackUri);
      }
      onError?.(e);
    },
    [fallbackUri, uri, onError],
  );

  if (!uri) {
    return null;
  }

  return <Image source={{ uri }} onError={handleError} {...rest} />;
}
