import { Stethoscope, Lock } from "lucide-react";

/**
 * Shown on every health tool. Two separate points, deliberately:
 *
 *  1. These are estimates from averages, not medical advice or diagnosis, and
 *     cycle-based dates are emphatically not contraception.
 *  2. The data never leaves the device — which matters more here than anywhere
 *     else on the site, because this is the most sensitive thing anyone will
 *     type into it.
 */
export function HealthNotice({ extra }: { extra?: string }) {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
        <Stethoscope className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
        <div>
          <h2 className="text-sm font-bold text-foreground">
            An estimate, not medical advice
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            This tool works from population averages and the dates you enter.
            Every body is different, and cycles vary from month to month. Use it
            as a rough guide only — not for diagnosis, and not as a method of
            contraception. For anything that matters, speak to a doctor,
            midwife or pharmacist.
            {extra ? ` ${extra}` : ""}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-brand/25 bg-brand/5 p-4">
        <Lock className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
        <div>
          <h2 className="text-sm font-bold text-foreground">
            Nothing you enter is saved
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            The dates and numbers you type stay in this browser tab. Nothing is
            sent to a server, written to storage, or logged anywhere. Close the
            tab and it is gone.
          </p>
        </div>
      </div>
    </div>
  );
}
