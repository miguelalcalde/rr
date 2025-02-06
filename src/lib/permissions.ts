export const PERMISSION_FLAGS = {
  IS_ADMIN: "isAdmin",
} as const;

export function getPermissionFlag(flag: keyof typeof PERMISSION_FLAGS): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PERMISSION_FLAGS[flag]) === "true";
}

export function setPermissionFlag(flag: keyof typeof PERMISSION_FLAGS, value: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PERMISSION_FLAGS[flag], String(value));
}

export function hasEditPermission(): boolean {
  return getPermissionFlag("IS_ADMIN");
}

export function hasDateOnlyPermission(): boolean {
  return !hasEditPermission();
}
