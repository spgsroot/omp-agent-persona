// PROTECTED. dependency-cruiser rules; run `depcruise src --config .dependency-cruiser.cjs`.
// Rename the layer paths to your layout: api -> service -> domain, adapters at the edge.
/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      comment: "Cycles make modules impossible to change or extract on their own.",
      from: {},
      to: { circular: true },
    },
    {
      name: "domain-is-pure",
      severity: "error",
      comment: "Domain logic does not depend on transport, storage or provider SDKs.",
      from: { path: "^src/domain" },
      to: { path: ["^src/(api|infra|adapters)", "node_modules/(express|fastify|hono|openai|@anthropic-ai|pg|ioredis)"] },
    },
    {
      name: "no-upward-imports",
      severity: "error",
      comment: "Lower layers never import higher ones.",
      from: { path: "^src/(domain|service)" },
      to: { path: "^src/api" },
    },
    {
      name: "adapters-are-independent",
      severity: "error",
      comment: "One provider adapter must not know another; share through ports in domain.",
      from: { path: "^src/adapters/([^/]+)/" },
      to: { path: "^src/adapters/", pathNot: "^src/adapters/$1/" },
    },
    {
      name: "no-test-code-in-src",
      severity: "error",
      from: { path: "^src", pathNot: "\\.(test|spec)\\.[cm]?[jt]sx?$" },
      to: { path: "\\.(test|spec)\\.[cm]?[jt]sx?$" },
    },
    {
      name: "not-to-dev-dep",
      severity: "error",
      comment: "Runtime code must not import devDependencies.",
      from: { path: "^src", pathNot: "\\.(test|spec)\\.[cm]?[jt]sx?$" },
      to: { dependencyTypes: ["npm-dev"], dependencyTypesNot: ["type-only"] },
    },
    {
      name: "no-orphans",
      severity: "warn",
      from: { orphan: true, pathNot: ["\\.d\\.[cm]?ts$", "(^|/)\\.[^/]+\\.[cm]?[jt]s$", "\\.(test|spec)\\.[cm]?[jt]sx?$"] },
      to: {},
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: "tsconfig.json" },
    enhancedResolveOptions: { exportsFields: ["exports"], conditionNames: ["import", "require", "node", "default", "types"] },
  },
};
