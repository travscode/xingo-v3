import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

/**
 * ArrowRightIcon component
 * @param {number} size - The size of the icon (width and height will be adjusted proportionally)
 */
export function ArrowRightIcon({ size = 18, className, ...props }: IconProps) {
  // The original SVG had 18x15 dimensions. We'll maintain that ratio.
  const width = size;
  const height = (size * 15) / 18;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 18 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M17.1328 8.38574C17.6211 7.89746 17.6211 7.10449 17.1328 6.61621L10.8828 0.366211C10.3945 -0.12207 9.60156 -0.12207 9.11328 0.366211C8.625 0.854492 8.625 1.64746 9.11328 2.13574L13.2344 6.25293H1.25C0.558594 6.25293 0 6.81152 0 7.50293C0 8.19434 0.558594 8.75293 1.25 8.75293H13.2305L9.11719 12.8701C8.62891 13.3584 8.62891 14.1514 9.11719 14.6396C9.60547 15.1279 10.3984 15.1279 10.8867 14.6396L17.1367 8.38965L17.1328 8.38574Z"
        fill="currentColor"
      />
    </svg>
  );
}
