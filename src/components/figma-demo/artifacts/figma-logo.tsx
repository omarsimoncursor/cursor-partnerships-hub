/**
 * Official Figma logomark — 5 colored shapes arranged in two columns and three
 * rows. This is the unmistakable Figma brand mark used in the file menu, OS
 * dock, and login. Reproduced from the public brand SVG so the Figma file
 * modal looks indistinguishable from the real app chrome.
 *
 *   ┌──┬──┐
 *   │ R│ O│   row 1: red (#F24E1E) + orange (#FF7262)
 *   ├──┼──┤
 *   │ P│ B│   row 2: purple (#A259FF) + blue circle (#1ABCFE)
 *   ├──┼──┘
 *   │ G│      row 3: green (#0ACF83)
 *   └──┘
 */
export function FigmaLogo({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={(size * 3) / 2}
      viewBox="0 0 38 57"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Bottom-left green — half-rounded */}
      <path
        d="M9.5 57c5.247 0 9.5-4.253 9.5-9.5V38H9.5C4.253 38 0 42.253 0 47.5S4.253 57 9.5 57Z"
        fill="#0ACF83"
      />
      {/* Middle-left purple square */}
      <path d="M0 28.5C0 23.253 4.253 19 9.5 19H19v19H9.5C4.253 38 0 33.747 0 28.5Z" fill="#A259FF" />
      {/* Top-left red */}
      <path d="M0 9.5C0 4.253 4.253 0 9.5 0H19v19H9.5C4.253 19 0 14.747 0 9.5Z" fill="#F24E1E" />
      {/* Top-right orange */}
      <path d="M19 0h9.5C33.747 0 38 4.253 38 9.5S33.747 19 28.5 19H19V0Z" fill="#FF7262" />
      {/* Middle-right blue circle */}
      <path d="M38 28.5c0 5.247-4.253 9.5-9.5 9.5S19 33.747 19 28.5 23.253 19 28.5 19 38 23.253 38 28.5Z" fill="#1ABCFE" />
    </svg>
  );
}
