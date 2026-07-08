import type { Handler } from "@netlify/functions";

import { bearer, verifyToken } from "./_lib/auth";
import { forbidden, methodNotAllowed, ok, serverError, unauthorized } from "./_lib/http";
import { readDataset } from "./_lib/store";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "GET") return methodNotAllowed();

  const payload = verifyToken(bearer(event.headers), Date.now());
  if (!payload) return unauthorized();
  if (payload.role !== "instructor") return forbidden();

  try {
    const data = await readDataset();
    return ok(data);
  } catch (err) {
    console.error("data error", err);
    return serverError();
  }
};
