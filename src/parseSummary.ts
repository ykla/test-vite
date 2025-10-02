import { readFile } from "fs/promises";
import { normalize } from "path";
import type { Options } from "../types";
import type { DefaultTheme } from "vitepress";
import { normalizeRoutePrefix, withRoutePrefix } from "./utils";

/** summary 处理逻辑 */
export default async function parseSummary(
  options: NonNullable<Options["summary"]>,
  prefix = ""
) {
  const { target, collapsed, removeEscape = true } = options;
  const normalizedPrefix = normalizeRoutePrefix(prefix);
  // 读取文件
  const file = await readFile(normalize(target), { encoding: "utf-8" });
  const lines = file.split(/\r?\n/).filter((item) => item.trim());

  // 最终配置
  const sidebar: DefaultTheme.Sidebar = [];
  const nav: DefaultTheme.NavItemWithLink[] = [];
  // 处理栈
  const stack: { depth: number; sidebarItem: DefaultTheme.SidebarItem }[] = [];
  // 缩进符
  let indent: string | undefined;

  for (let i = 0; i < lines.length; i++) {
    let lastItem = stack[stack.length - 1];
    const str = lines[i];
    const trimStr = str.trim();

    if (trimStr.startsWith("#")) {
      // 处理标题
      let [_, flag, text] = /^\s*(#+)\s+(.+?)\s*$/.exec(str) || [];
      if (!flag || !text) continue;
      text = removeEscape ? text.replace(/\\/g, "") : text;

      // 标题层级
      const depth = -flag.length;
      const sidebarItem: DefaultTheme.SidebarItem = {
        text,
        items: [],
        collapsed,
      };

      if (depth === -1) {
        // 一级标题直接入栈
        sidebar.push(sidebarItem);
        stack.push({ depth, sidebarItem });
        nav.push({ text, link: "" });
      } else {
        // 其他级别标题，需要先找到栈中的一级标题
        while (lastItem && (lastItem.depth >= 0 || lastItem.depth <= depth)) {
          stack.pop();
          lastItem = stack[stack.length - 1];
        }
        if (lastItem?.sidebarItem) {
          lastItem.sidebarItem.items?.push(sidebarItem);
          stack.push({ depth, sidebarItem });
        }
      }
    } else if (trimStr.startsWith("*") || trimStr.startsWith("-")) {
      // 处理菜单项
      let [_, strIndent, text, link] =
        /^(\s*)[\*\-]\s+\[(.+)\]\((.+).md\)\s*$/.exec(str) || [];
      if (!link) continue;
      if (!link.startsWith("/")) link = `/${link}`;
      text = removeEscape ? text.replace(/\\/g, "") : text;

      const sidebarItem: DefaultTheme.SidebarItem = {
        text,
        link,
        items: [],
        collapsed,
      };

      if (indent === undefined && strIndent) indent = strIndent;

      const depth = strIndent ? strIndent.length / indent!.length : 0;

      while (lastItem && lastItem.depth >= depth) {
        stack.pop();
        lastItem = stack[stack.length - 1];
      }
      if (lastItem?.sidebarItem) {
        lastItem.sidebarItem.items?.push(sidebarItem);
        stack.push({ depth, sidebarItem });
        if (nav.length && !nav[nav.length - 1].link) {
          nav[nav.length - 1].link = link;
        }
      }
    }
  }

  if (normalizedPrefix) {
    const appendPrefix = (items?: DefaultTheme.SidebarItem[]) => {
      if (!items) return;
      for (const item of items) {
        if (item.link) {
          item.link = withRoutePrefix(normalizedPrefix, item.link);
        }
        appendPrefix(item.items);
      }
    };
    appendPrefix(sidebar as DefaultTheme.SidebarItem[]);
    for (const item of nav) {
      if (item.link) {
        item.link = withRoutePrefix(normalizedPrefix, item.link);
      }
    }
  }

  return { sidebar, nav };
}
