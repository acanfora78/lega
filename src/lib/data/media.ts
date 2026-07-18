import { legaData } from "@/lib/mock";
import type { AlbumMedia } from "@/lib/types";

export async function getAlbum(): Promise<AlbumMedia[]> {
  return [...(await legaData()).albumMedia].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
}

export async function getAlbumById(id: string): Promise<AlbumMedia | undefined> {
  return (await legaData()).albumMedia.find((a) => a.id === id);
}

export async function getFoto(): Promise<AlbumMedia[]> {
  return (await getAlbum()).filter((a) => a.tipo === "foto");
}

export async function getVideo(): Promise<AlbumMedia[]> {
  return (await getAlbum()).filter((a) => a.tipo === "video");
}
