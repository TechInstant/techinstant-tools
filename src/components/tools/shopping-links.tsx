"use client";

import { useState } from "react";
import { ShoppingCart, ExternalLink } from "lucide-react";
import { Select } from "@/components/ui/input";
import { ToolPanel, Field, CopyButton } from "@/components/tools/tool-ui";
import { SHOPS, SHOP_GROUPS, getShop, AFFILIATE_DISCLOSURE } from "@/lib/shops";

/**
 * Turns the ticked items into retailer search links.
 *
 * One link per item rather than one giant basket, for two honest reasons: there
 * is no way to pre-fill a basket without a retailer API and credentials, and
 * opening a dozen tabs at once is blocked by every browser anyway. Each link is
 * built here in the page, so nothing about your list is sent anywhere until you
 * choose to click one.
 */
export function ShoppingLinks({ items }: { items: string[] }) {
  const [shopId, setShopId] = useState(SHOPS[0].id);
  const shop = getShop(shopId);

  /* Checklist labels are written for people, not search boxes. Trimming the
     parenthetical and the "— note" tail gives a far better search. */
  const searchTerm = (label: string) =>
    label
      .replace(/\s*\([^)]*\)/g, "")
      .replace(/\s*[—–-]\s.*$/, "")
      .replace(/^(a|an|the)\s+/i, "")
      .trim();

  return (
    <ToolPanel className="space-y-4">
      <div className="flex items-start gap-3">
        <ShoppingCart className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold tracking-tight text-foreground">
            Shop your ticked items
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {items.length === 0
              ? "Tick the things you still need to buy and search links will appear here."
              : `${items.length} ${items.length === 1 ? "item" : "items"} ticked. Each opens a search on your chosen store in a new tab.`}
          </p>
        </div>
      </div>

      <div className="sm:max-w-sm">
        <Field
          label="Store"
          htmlFor="shop-store"
          hint={
            shop.secondHand
              ? "Mostly private sellers, so good for the things worth buying used — but never a car seat or a cot mattress."
              : undefined
          }
        >
          <Select id="shop-store" value={shopId} onChange={(e) => setShopId(e.target.value)}>
            {/* Grouped by region, because a flat list of 18 storefronts is
                tedious to scan on a phone. */}
            {SHOP_GROUPS.map((group) => {
              const inGroup = SHOPS.filter((s) => s.group === group);
              if (inGroup.length === 0) return null;
              return (
                <optgroup key={group} label={group}>
                  {inGroup.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.region}
                      {s.secondHand ? " (used)" : ""}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </Select>
        </Field>
      </div>

      {items.length > 0 && (
        <>
          <ul className="flex flex-wrap gap-2">
            {items.map((label) => (
              <li key={label}>
                <a
                  href={shop.search(searchTerm(label))}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex min-h-11 max-w-full items-center gap-1.5 rounded-lg border border-border bg-background-subtle px-3 text-sm font-medium text-foreground transition-colors hover:border-brand hover:text-brand"
                >
                  <span className="truncate">{searchTerm(label)}</span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70" />
                </a>
              </li>
            ))}
          </ul>

          <CopyButton
            value={items.map(searchTerm).join("\n")}
            label="Copy shopping list"
          />
        </>
      )}

      <p className="text-xs leading-relaxed text-muted-foreground">
        These are ordinary search links. We are not a retailer, we do not see
        what you buy, and your ticked list is never sent anywhere — the link is
        assembled in your browser when you click it. Prices, availability and
        suitability are the store&apos;s, so check that a product actually meets
        your local safety standards, particularly for car seats and mattresses.
        {AFFILIATE_DISCLOSURE
          ? " Some links may earn us a small commission at no extra cost to you."
          : ""}
      </p>
    </ToolPanel>
  );
}
