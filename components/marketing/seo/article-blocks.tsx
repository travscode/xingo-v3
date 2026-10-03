import type { BlogBlock } from "@/lib/blog/types";
import { RichText } from "@/components/marketing/seo/rich-text";

/** Renders one structured content block (blog articles and guide pages). */
export function ArticleBlock({ block }: { block: BlogBlock }) {
  switch (block.type) {
    case "p":
      return (
        <p className="text-[16px] leading-7 text-gray-700">
          <RichText text={block.text} />
        </p>
      );
    case "ul":
    case "ol": {
      const List = block.type === "ul" ? "ul" : "ol";
      return (
        <List
          className={`space-y-2 pl-5 text-[16px] leading-7 text-gray-700 ${block.type === "ul" ? "list-disc" : "list-decimal"} marker:text-gray-500`}
        >
          {block.items.map((item) => (
            <li key={item} className="pl-1">
              <RichText text={item} />
            </li>
          ))}
        </List>
      );
    }
    case "callout":
      return (
        <div className="rounded-xl bg-gray-50 p-5">
          {block.title ? <p className="font-bold">{block.title}</p> : null}
          <p className={`text-[15px] leading-6 text-gray-700 ${block.title ? "mt-1" : ""}`}>
            <RichText text={block.text} />
          </p>
        </div>
      );
    case "table":
      return (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
            {block.caption ? <caption className="px-4 pt-3 text-left text-xs text-gray-500">{block.caption}</caption> : null}
            <thead>
              <tr className="border-b border-gray-200">
                {block.head.map((cell) => (
                  <th key={cell} scope="col" className="px-4 py-3 font-semibold">
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-3 align-top leading-6 text-gray-700">
                      <RichText text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "example":
      return (
        <figure className="rounded-xl border border-gray-200 p-5">
          {block.label ? <figcaption className="eyebrow mb-3">{block.label}</figcaption> : null}
          <dl className="space-y-2 text-[15px] leading-6">
            {block.lines.map((line, index) => (
              <div key={index} className="grid gap-x-3 sm:grid-cols-[8rem_1fr]">
                <dt className="font-semibold">{line.speaker}</dt>
                <dd className="text-gray-700">
                  <RichText text={line.text} />
                </dd>
              </div>
            ))}
          </dl>
        </figure>
      );
  }
}
