import { legaData } from "@/lib/mock";
import type { AlbumMedia } from "@/lib/types";

export function getAlbum(): AlbumMedia[] {
  return [...legaData().albumMedia].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
}

export function getAlbumById(id: string): AlbumMedia | undefined {
  return legaData().albumMedia.find((a) => a.id === id);
}

export function getFoto(): AlbumMedia[] {
  return getAlbum().filter((a) => a.tipo === "foto");
}

export function getVideo(): AlbumMedia[] {
  return getAlbum().filter((a) => a.tipo === "video");
}
