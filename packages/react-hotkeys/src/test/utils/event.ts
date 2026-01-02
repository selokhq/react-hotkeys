export function createKeyboardEvent(
  key: string,
  code: string,
  modifier?: {
    ctrlKey?: boolean;
    altKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
  },
) {
  return new KeyboardEvent("keydown", {
    ...modifier,
    key,
    code,
    cancelable: true,
  });
}
