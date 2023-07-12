export function vNode<T extends keyof HTMLElementTagNameMap>(
  tag: T,
  param1: {
    style?: Partial<CSSStyleDeclaration> & Record<string, string>
    parent?: Element;
    classList?: string[];
    attributes?: Partial<HTMLInputElement>;
  }
): HTMLElementTagNameMap[T];
