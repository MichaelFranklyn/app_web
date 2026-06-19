"use server";

import { updateTag } from "next/cache";

export async function revalidateFactoryDetail(id: string) {
  updateTag(`company_factory:${id}`);
}
