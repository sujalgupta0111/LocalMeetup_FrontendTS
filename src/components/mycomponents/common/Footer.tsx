
export default function Footer() {
  return (
    <footer className="
      w-full shrink-0
      border-t border-border/60
      bg-background/80
      backdrop-blur-sm
    ">
      <div className="
        mx-auto flex w-full max-w-[1600px]
        flex-col items-center justify-between
        gap-2 px-3 py-3 text-center
        sm:flex-row sm:gap-4 sm:px-5
        sm:py-4 sm:text-left lg:px-8
      ">
        <p className="text-xs text-muted-foreground sm:text-sm">
          © 2026 Northstar Labs. Built for modern product teams.
        </p>
        <div className="footer-links" />
      </div>
    </footer>
  );
}