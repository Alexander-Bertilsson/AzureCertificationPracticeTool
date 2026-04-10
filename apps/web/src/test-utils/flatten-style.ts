// Merges React Native's StyleProp (array / single / nullish layers) into a flat
// plain object so tests can assert on specific style properties without caring
// about how many layers the component passed in.

export function flattenStyle(input: unknown): Record<string, unknown> {
  const layers: unknown[] = Array.isArray(input) ? input : [input];
  const objects = layers.filter(
    (layer): layer is object => layer !== null && typeof layer === 'object',
  );
  return Object.assign({}, ...objects) as Record<string, unknown>;
}
