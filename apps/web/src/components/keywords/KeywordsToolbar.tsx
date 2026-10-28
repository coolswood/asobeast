"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { useQueryState } from "nuqs";
import type { Store } from "@asobeast/shared";
import { Button } from "@/components/ui/button";
import { MarketPills } from "@/components/layout/MarketPills";
import { keywordCountriesOptions, keywordsOptions } from "@/lib/queries";
import { countryParser } from "@/lib/search-params";
import { AddKeywordsDialog } from "./AddKeywordsDialog";

export function KeywordsToolbar({
  id,
  store,
  market,
  homeCountry,
}: {
  id: string;
  store: Store;
  market: string;
  homeCountry: string;
}) {
  const [, setCountry] = useQueryState("country", countryParser);
  const { data: markets } = useSuspenseQuery(keywordCountriesOptions(id));
  const { data: keywords } = useSuspenseQuery(keywordsOptions(id, market));

  const total = markets.reduce((sum, entry) => sum + entry.keywordCount, 0);
  const active = keywords.filter((keyword) => keyword.active).length;
  const partial = keywords.length !== total;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <MarketPills
          markets={markets.map((entry) => ({
            country: entry.country,
            count: entry.keywordCount,
          }))}
          value={market}
          onChange={(next) => {
            if (next) void setCountry(next);
          }}
          ariaLabel="Keyword markets"
        />
        <AddKeywordsDialog appId={id} store={store} country={market}>
          <Button variant="outline" size="sm" aria-label="Add a market">
            <Plus />
          </Button>
        </AddKeywordsDialog>
      </div>

      {market !== homeCountry ? (
        <button
          type="button"
          onClick={() => void setCountry(null)}
          className="inline-flex items-center gap-1.5 rounded-full border border-dashed px-2.5 py-1 text-caption hover:bg-muted"
        >
          Market: {market.toUpperCase()}
          <X className="size-3 opacity-60" aria-hidden />
          <span className="sr-only">Clear the market filter</span>
        </button>
      ) : null}

      <p className="text-body text-muted-foreground" aria-live="polite">
        Tracking{" "}
        <span className="numeric font-mono font-medium text-foreground">
          {keywords.length}
        </span>
        {partial ? (
          <>
            {" of "}
            <span className="numeric font-mono font-medium text-foreground">
              {total}
            </span>
          </>
        ) : null}{" "}
        keyword{keywords.length === 1 ? "" : "s"} ·{" "}
        <span className="numeric font-mono font-medium text-foreground">
          {active}
        </span>{" "}
        active
      </p>
    </div>
  );
}
