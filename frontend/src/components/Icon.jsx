// Ícone Google Material Symbols (Rounded). Nomes em https://fonts.google.com/icons
export function Icon({ name, size = 20, filled = false, style, ...props }) {
  return (
    <span
      className="icon"
      data-filled={filled}
      aria-hidden="true"
      style={{ fontSize: size, width: size, height: size, ...style }}
      {...props}
    >
      {name}
    </span>
  )
}
