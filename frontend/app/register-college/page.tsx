import Link from "next/link"

import { Button } from "@/components/ui/button"
import { CollegeRegistrationForm } from "@/components/college-registration-form"

export default function RegisterCollegePage() {
  return (
    <div className="grid min-h-dvh bg-background lg:grid-cols-2">
      <div className="flex flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 md:px-10">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <span className="text-sm font-semibold">E</span>
            </div>
            <span className="text-sm font-semibold tracking-tight text-foreground">
              Yukti ERP
            </span>
          </div>
          <Button asChild variant="ghost" className="h-9 px-3 text-muted-foreground hover:text-foreground">
            <Link href="/">Back</Link>
          </Button>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xl">
            <CollegeRegistrationForm />
          </div>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-muted lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/60 to-background" />
        <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_20%_10%,hsl(var(--primary)/0.18),transparent_45%),radial-gradient(circle_at_80%_30%,hsl(var(--primary)/0.10),transparent_40%),radial-gradient(circle_at_40%_80%,hsl(var(--primary)/0.08),transparent_45%)]" />
      </div>
    </div>
  )
}

