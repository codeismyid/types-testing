export type KeyOf<T> = T extends T ? keyof T : never;
