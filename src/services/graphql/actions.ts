"use server";

import { updateTag } from "next/cache";

export async function invalidateCache(tag: string) {
  updateTag(tag);
}

export async function invalidateCacheMany(tags: string[]) {
  for (const tag of tags) {
    updateTag(tag);
  }
}
