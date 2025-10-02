# vite-plugin-vitepress-auto-nav

[中文文档](./README-CN.md)

Auto-generate `VitePress` `nav` and `sidebar` configurations.

## ✨ Features

- Use primary folder as `nav` and secondary folder and files as `sidebar`
- Automatic refresh after changing plugin configuration or `frontmatter`.
- Support for customizing read ranges (based on `srcDir` and `srcExclude` configurations).
- Support to customize whether the `index.md` under the sub-folder is displayed separately or by clicking the folder name.
- Support for customizing the display name, articles also support the first level of the title as the name.
- Support for customizing the sorting method
- Support for customizing hidden files or folders
- Supports both plugin options and article `frontmatter` configurations to customize article configurations (configured attribute names also support adding prefixes).
- Support for using the same `Gitbook` `SUMMARY.md` file as the `sidebar` configuration.

## 🕯️ Usage

1. Install

```sh
# Installing vite is recommended when using ts, otherwise you will get type errors.
pnpm i vite-plugin-vitepress-auto-nav vite -D
```

2. Add the plugin

```ts
// .vitepress/config.ts
import AutoNav from “vite-plugin-vitepress-auto-nav”;

export default defineConfig({
  vite: {
    plugins: [
      AutoNav({
        // Custom configurations
      })
    ]
  }
});
```

3. Start the project normally and it's ready to use

## Configuration

Please refer to the TypeScript type hints

### `prefix`

When you need to host multiple documentation projects within the same VitePress build, you can give each plugin instance its own route prefix. The option is entirely optional—if you omit `prefix`, AutoNav leaves all generated links as-is so the instance mounts on the default `/` routes.

```ts
AutoNav({
  srcDir: "docs",
  summary: {
    target: "docs/FreeBSD-Ask/SUMMARY.md",
    collapsed: false,
  },
  prefix: "/FreeBSD-Ask/",
});
```

Each instance will generate navigation data that is automatically mounted under the configured `prefix`, so you can declare multiple instances—one per documentation folder—to provide independent sidebars such as `/FreeBSD-Ask/`, `/Handbook/`, and so on.

```ts
export default defineConfig({
  vite: {
    plugins: [
      AutoNav({
        srcDir: "docs",
        summary: {
          target: "docs/1/SUMMARY.md",
          collapsed: false,
        },
        prefix: "/1/",
      }),
      AutoNav({
        srcDir: "docs",
        summary: {
          target: "docs/2/SUMMARY.md",
          collapsed: false,
        },
        prefix: "/2/",
      }),
    ],
  },
});
```

In the example above, the plugin mounts the generated navigation from `docs/1` under `/1/` and `docs/2` under `/2/`, letting each documentation section ship with its own sidebar inside the same VitePress project.

## License

[MIT](./LICENSE) License © 2023 [Xaviw](https://github.com/Xaviw)
