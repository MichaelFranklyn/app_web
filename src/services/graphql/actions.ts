"use server";

import { revalidatePath, updateTag } from "next/cache";

export async function invalidateCache(tag: string) {
  updateTag(tag);
}

export async function invalidateCacheMany(tags: string[]) {
  for (const tag of tags) {
    updateTag(tag);
  }
}

export async function invalidateAllCache() {
  updateTag("global");
}

export async function invalidateCacheByPrefixAndPath(
  groupTag: string,
  path: string
) {
  revalidatePath(path, "layout");
}
