import type svgr from 'vite-plugin-svgr';

/**
 * Makes ids inside SVG components unique per rendered instance.
 *
 * SVGs exported from Figma use fixed ids (`mask0_4673_488`, `clip0_…`) referenced via `url(#…)`.
 * Rendering the same SVG twice duplicates those ids; if the first copy is hidden
 * (`display: none`), the visible copy resolves `url(#…)` to the hidden mask and parts of the
 * artwork disappear. This rewrites every `id="x"` to `${useId()}-x` and every `url(#x)` /
 * `href="#x"` to match.
 */

type SvgrOptions = NonNullable<NonNullable<Parameters<typeof svgr>[0]>['svgrOptions']>;

const ID_VAR = '__svgId';

// Minimal slice of @babel/types used below.
type BabelNode = { type: string };
type StringLiteral = BabelNode & { type: 'StringLiteral'; value: string };
type BabelTypes = {
  isStringLiteral(node: unknown): node is StringLiteral;
  identifier(name: string): BabelNode;
  templateElement(value: { raw: string; cooked: string }, tail: boolean): BabelNode;
  templateLiteral(quasis: BabelNode[], expressions: BabelNode[]): BabelNode;
  jsxExpressionContainer(expression: BabelNode): BabelNode;
};
type JSXAttributePath = { node: { name: { name: unknown }; value: unknown } };

/** `url(#a) url(#b)` → template literal `url(#${id}-a) url(#${id}-b)`. */
function rewrite(t: BabelTypes, value: string, pattern: RegExp, wrap: (ref: string) => string[]) {
  const quasis: string[] = [];
  let rest = value;
  let match: RegExpExecArray | null;
  let current = '';
  pattern.lastIndex = 0;
  while ((match = pattern.exec(value))) {
    const [before, after] = wrap(match[1]);
    current += value.slice(value.length - rest.length, match.index) + before;
    quasis.push(current);
    current = after;
    rest = value.slice(match.index + match[0].length);
  }
  if (!quasis.length) return null;
  quasis.push(current + rest);
  const id = t.identifier(ID_VAR);
  return t.jsxExpressionContainer(
    t.templateLiteral(
      quasis.map((raw, i) => t.templateElement({ raw, cooked: raw }, i === quasis.length - 1)),
      quasis.slice(1).map(() => id),
    ),
  );
}

function uniqueIdsPlugin({ types: t }: { types: BabelTypes }) {
  return {
    visitor: {
      JSXAttribute(path: JSXAttributePath) {
        const { name, value } = path.node;
        if (!t.isStringLiteral(value)) return;
        const replaced =
          name.name === 'id'
            ? rewrite(t, value.value, /^(.+)$/g, (ref) => ['', `-${ref}`])
            : name.name === 'href' || name.name === 'xlinkHref'
              ? rewrite(t, value.value, /^#(.+)$/g, (ref) => ['#', `-${ref}`])
              : rewrite(t, value.value, /url\(#([^)]+)\)/g, (ref) => ['url(#', `-${ref})`]);
        if (replaced) path.node.value = replaced;
      },
    },
  };
}

const template: SvgrOptions['template'] = (variables, { tpl }) => tpl`
${variables.imports};

${variables.interfaces};

const ${variables.componentName} = (${variables.props}) => {
  const ${ID_VAR} = React.useId();
  return ${variables.jsx};
};

${variables.exports};
`;

export const svgrOptions: SvgrOptions = {
  // Size comes from className; viewBox keeps the aspect ratio.
  dimensions: false,
  template,
  jsx: { babelConfig: { plugins: [uniqueIdsPlugin] } },
};
