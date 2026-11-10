
import { LoginModal } from "@/components/mycomponents/modal/LoginModal";
import { AnimatedBorder } from "@/components/mycomponents/ui";
import ThemeToggle from "@/components/icons/ThemeToggle";
import {Footer} from "@/components/mycomponents/common";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-8 sm:px-6">
      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>

      {/* ================= BACKGROUND ================= */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Violet glow */}
        <div
          className="
            absolute
            -left-32
            -top-32
            h-96
            w-96
            rounded-full
            bg-violet-400/20
            dark:bg-violet-600/15
            blur-3xl
          "
        />

        {/* Cyan glow */}
        <div
          className="
            absolute
            -bottom-40
            -right-32
            h-[28rem]
            w-[28rem]
            rounded-full
            bg-cyan-400/20
            dark:bg-cyan-600/15
            blur-3xl
          "
        />

        {/* Pink glow */}
        <div
          className="
            absolute
            left-1/2
            top-1/3
            h-72
            w-72
            -translate-x-1/2
            rounded-full
            bg-fuchsia-300/15
            dark:bg-fuchsia-600/10
            blur-3xl
          "
        />

        {/* Subtle grid */}
        <div
          className="
            absolute
            inset-0
            opacity-[0.03]
            dark:opacity-[0.04]
            [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)]
            [background-size:40px_40px]
          "
        />
      </div>

      {/* ================= CONTENT ================= */}
      <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="w-full max-w-md">
          {/* ================= LOGIN CARD ================= */}
          <AnimatedBorder color="purple" borderRadius="rounded-3xl">
            <LoginModal />
          </AnimatedBorder>

          {/* ================= FOOTER ================= */}
      <Footer />
        </div>
      </div>
    </main>
  );
}
