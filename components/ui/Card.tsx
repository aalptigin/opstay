import { clsx } from "clsx";

export default function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-2xl bg-white/5 border border-white/10 backdrop-blur px-5 py-4 shadow-sm",
        className
      )}
      {...props}
    />
  );
}
