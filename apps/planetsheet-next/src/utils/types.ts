export type ArrayElementType<T> = T extends (infer E)[] ? E : T;
