export function requireManager(role: string) {
  if (role !== "manager") {
    const err = new Error("Forbidden: manager only");
    // @ts-expect-error
    err.status = 403;
    throw err;
  }
}
