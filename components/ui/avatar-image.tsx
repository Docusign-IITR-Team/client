'use client';

import Image from 'next/image';
import { Avatar, AvatarFallback } from './avatar';

interface AvatarImageProps {
  src: string;
  alt: string;
  fallback: string;
}

export function AvatarImage({ src, alt, fallback }: AvatarImageProps) {
  return (
    <Avatar>
      <Image
        src={src}
        alt={alt}
        width={40}
        height={40}
        className="rounded-full object-cover"
      />
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  );
}
