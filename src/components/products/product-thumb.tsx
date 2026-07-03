"use client";

import Image from "next/image";
import { useState } from "react";

/** Фото товара с фолбэком на первую букву названия */
export function ProductThumb({
  name,
  imageUrl,
  size = 40,
}: {
  name: string;
  imageUrl: string | null;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);

  if (!imageUrl || failed) {
    return (
      <span
        style={{ width: size, height: size }}
        className="flex shrink-0 items-center justify-center rounded-lg border border-line bg-gradient-to-br from-violet-500/15 to-cyan-500/10 text-sm font-semibold text-text-secondary"
        aria-hidden
      >
        {name.charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt=""
      width={size}
      height={size}
      onError={() => setFailed(true)}
      className="shrink-0 rounded-lg border border-line object-cover"
      style={{ width: size, height: size }}
    />
  );
}
