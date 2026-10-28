"use client";
import { cn } from "cn";
import { Button } from "@heroui/react";
import { Card, CardContent } from "@/components/ui/card";
import {
  FieldDescription,
  FieldGroup,
  FieldSeparator,
} from "@/components/ui/field";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";
import { useState } from "react";
import { useRegister } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function SignUpForm({
  className,
}: {
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const register = useRegister();
  const router = useRouter();

  const inputClass =
    "h-12 w-full rounded-xl border border-[#ead8d7] bg-[#fffdfc] px-4 text-sm text-[#492a30] placeholder:text-[#c2aaab] outline-none transition focus:border-[#c66f7d] focus:ring-2 focus:ring-[#f3d5d8]";

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (name.length < 3) {
      setError("Name must be at least 3 characters.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError(null);
    register.mutate(
      { name, email, password },
      {
        onSuccess: () => router.push("/"),
        onError: (err: unknown) => {
          const msg =
            err instanceof Error ? err.message : "Registration failed. Please try again.";
          setError(msg);
        },
      }
    );
  };

  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center",
        "bg-[#fff8f6] px-4 py-12 sm:px-6",
        className,
      )}
    >
      <div className="w-full max-w-5xl">
        <div className="h-10" />
        <Card className="overflow-hidden rounded-3xl border border-[#f4dedb] bg-white p-0 shadow-[0_20px_70px_rgba(139,67,74,0.10)]">
          <CardContent className="grid p-0 md:grid-cols-2">
            {/* Register Form */}
            <form className="p-7 sm:p-10 lg:p-12" onSubmit={onSubmit}>
              <FieldGroup className="gap-5">
                {/* Brand */}
                <div className="mb-5 text-center">
                  <div className="mb-3 flex items-center justify-center gap-2">
                    <div className="flex size-10 items-center justify-center rounded-full bg-[#fce8e6] text-[#a84759]">
                      <Sparkles className="size-5" />
                    </div>
                    <span className="text-2xl font-heading font-bold tracking-tight text-[#713944]">
                      Kenlivo
                    </span>
                  </div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#b77b83]">
                    Beauty Meets Lifestyle
                  </p>
                </div>

                <div className="mb-2 space-y-2 text-center">
                  <h1 className="text-3xl font-heading font-semibold tracking-tight text-[#492a30]">
                    Create Account
                  </h1>
                  <p className="text-sm leading-6 text-[#987b7e]">
                    Begin your beauty journey with Kenlivo.
                  </p>
                </div>

                {error && (
                  <p className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-600">
                    {error}
                  </p>
                )}

                <div className="space-y-4">
                  <div>
                    <Label className="mb-1.5 block text-sm font-medium text-[#65454b]">
                      Full Name
                    </Label>
                    <input
                      type="text"
                      autoComplete="name"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <Label className="mb-1.5 block text-sm font-medium text-[#65454b]">
                      Email Address
                    </Label>
                    <input
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <Label className="mb-1.5 block text-sm font-medium text-[#65454b]">
                      Create Password
                    </Label>
                    <div className="relative">
                      <input
                        type={isVisible ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Minimum 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className={cn(inputClass, "pr-12")}
                      />
                      <button
                        type="button"
                        onClick={() => setIsVisible(!isVisible)}
                        aria-label={isVisible ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a77c82] hover:text-[#a84759]"
                      >
                        {isVisible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={register.isPending}
                    className="h-12 w-full rounded-xl bg-[#c96778] text-sm font-semibold text-white shadow-md shadow-[#c96778]/20 transition-all hover:bg-[#ad5064] hover:shadow-lg"
                  >
                    {!register.isPending && <ArrowRight className="mr-2 size-4" />}
                    Create Account
                  </Button>
                </div>

                <FieldSeparator className="text-xs text-[#b69a9c] [&>span]:bg-white">
                  Or continue with
                </FieldSeparator>

                <Button
                  variant="outline"
                  type="button"
                  className="h-12 w-full rounded-xl border-[#ead8d7] bg-white text-sm text-[#65454b] transition-colors hover:bg-[#fff5f3]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 size-4">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Continue with Google
                </Button>

                <FieldDescription className="pt-2 text-center text-sm text-[#987b7e]">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-[#b94f64] underline-offset-4 hover:underline"
                  >
                    Sign In
                  </Link>
                </FieldDescription>
              </FieldGroup>
            </form>

            {/* Beauty Theme Panel */}
            <div className="relative hidden min-h-[650px] overflow-hidden bg-[#f9e5e1] md:block">
              <img
                src="/images/glowora-beauty.jpg"
                alt="Glowora beauty and skincare collection"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#512d35]/85 via-[#6e3d45]/10 to-[#fff4f0]/10" />
              <div className="absolute left-8 right-8 top-9">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/60 px-4 py-2 text-xs font-medium text-[#713944] backdrop-blur-md">
                  <Sparkles className="size-3.5" />
                  YOUR BEAUTY, OUR PASSION
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-10 text-white">
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-[#ffe0d9]">
                  Discover Your Glow
                </p>
                <h2 className="max-w-md text-4xl font-heading font-semibold leading-tight lg:text-5xl">
                  Glow Naturally,
                  <br />
                  Look Beautiful.
                </h2>
                <p className="mt-4 max-w-sm text-sm leading-7 text-white/85">
                  Explore premium skincare, cosmetics, and everyday beauty
                  essentials made to celebrate your natural glow.
                </p>
                <div className="mt-7 flex items-center gap-3">
                  <div className="h-px w-10 bg-[#f2bdba]" />
                  <span className="text-xs tracking-widest text-[#ffe0d9]">
                    BEAUTY IN EVERY GLOW
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs leading-6 text-[#a78b8d]">
          By creating an account, you agree to our{" "}
          <a href="/terms" className="text-[#b94f64] underline underline-offset-4">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-[#b94f64] underline underline-offset-4">
            Privacy Policy
          </a>
          .
        </p>
        <p className="mt-3 text-center font-heading text-sm italic text-[#c69a9e]">
          Beauty is not just a look, it&apos;s a feeling ♡
        </p>
      </div>
    </div>
  );
}
