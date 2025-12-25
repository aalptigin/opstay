import { clsx } from "clsx";

export default function Button({
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
}) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition",
        variant === "primary" &&
          "bg-blue-600 text-white hover:bg-blue-500 shadow-sm",
        variant === "ghost" &&
          "bg-transparent text-slate-100/90 hover:bg-white/10",
        className
      )}
      {...props}
    />
  );
}
