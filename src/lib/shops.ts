/**
 * Search links for the shopping checklists.
 *
 * These are plain search URLs, built in the browser at the moment you click.
 * We deliberately do not pre-load a basket or hit any retailer API: that would
 * need credentials, and it would mean sending your list to a third party, which
 * is exactly what these tools promise not to do.
 *
 * Every search path here was checked against the live site. A retailer can
 * change its URL scheme at any time, so if a link starts landing on a 404 the
 * pattern is what to look at first.
 */

export interface Shop {
  id: string;
  name: string;
  /** Shown so people can tell which storefront they are being sent to. */
  region: string;
  /** Groups the picker, so a long list stays navigable. */
  group: "Africa" | "Global" | "Europe" | "Americas" | "Asia & Middle East";
  /** Flagged where a store is mostly private sellers rather than retail. */
  secondHand?: boolean;
  search: (query: string) => string;
}

/**
 * Affiliate tags, empty by default.
 *
 * Fill these in with your own retailer IDs if you join their programmes. They
 * are left blank rather than guessed, because sending traffic under someone
 * else's tag would credit the wrong account — and because a site that earns
 * commission should say so, which is what `AFFILIATE_DISCLOSURE` is for.
 */
export const AFFILIATE_TAGS: Record<string, string> = {
  amazon: "",
  jumia: "",
  konga: "",
  aliexpress: "",
  ebay: "",
};

export const AFFILIATE_DISCLOSURE = Object.values(AFFILIATE_TAGS).some(Boolean);

const withTag = (url: string, param: string, tag: string) =>
  tag ? `${url}&${param}=${encodeURIComponent(tag)}` : url;

const e = encodeURIComponent;

/** Jumia runs the same platform on every country domain. */
const jumia = (id: string, region: string, host: string): Shop => ({
  id,
  name: "Jumia",
  region,
  group: "Africa",
  search: (q) =>
    withTag(`https://${host}/catalog/?q=${e(q)}`, "utm_source", AFFILIATE_TAGS.jumia),
});

/** Amazon likewise. */
const amazon = (
  id: string,
  region: string,
  host: string,
  group: Shop["group"]
): Shop => ({
  id,
  name: "Amazon",
  region,
  group,
  search: (q) => withTag(`https://${host}/s?k=${e(q)}`, "tag", AFFILIATE_TAGS.amazon),
});

export const SHOPS: Shop[] = [
  /* ------------------------------------------------------------- Africa */
  jumia("jumia-ng", "Nigeria", "www.jumia.com.ng"),
  {
    id: "konga-ng",
    name: "Konga",
    region: "Nigeria",
    group: "Africa",
    search: (q) =>
      withTag(`https://www.konga.com/search?search=${e(q)}`, "utm_source", AFFILIATE_TAGS.konga),
  },
  {
    id: "jiji-ng",
    name: "Jiji",
    region: "Nigeria",
    group: "Africa",
    secondHand: true,
    search: (q) => `https://jiji.ng/search?query=${e(q)}`,
  },
  jumia("jumia-ke", "Kenya", "www.jumia.co.ke"),
  jumia("jumia-gh", "Ghana", "www.jumia.com.gh"),
  jumia("jumia-eg", "Egypt", "www.jumia.com.eg"),
  {
    id: "takealot-za",
    name: "Takealot",
    region: "South Africa",
    group: "Africa",
    search: (q) => `https://www.takealot.com/all?qsearch=${e(q)}`,
  },

  /* ----------------------------------------------------------- Americas */
  amazon("amazon-com", "United States", "www.amazon.com", "Americas"),
  {
    id: "walmart-us",
    name: "Walmart",
    region: "United States",
    group: "Americas",
    search: (q) => `https://www.walmart.com/search?q=${e(q)}`,
  },
  amazon("amazon-ca", "Canada", "www.amazon.ca", "Americas"),

  /* ------------------------------------------------------------- Europe */
  amazon("amazon-uk", "United Kingdom", "www.amazon.co.uk", "Europe"),
  amazon("amazon-de", "Germany", "www.amazon.de", "Europe"),

  /* ------------------------------------------- Asia & the Middle East */
  {
    id: "flipkart-in",
    name: "Flipkart",
    region: "India",
    group: "Asia & Middle East",
    search: (q) => `https://www.flipkart.com/search?q=${e(q)}`,
  },
  amazon("amazon-ae", "United Arab Emirates", "www.amazon.ae", "Asia & Middle East"),
  {
    id: "noon-ae",
    name: "Noon",
    region: "United Arab Emirates",
    group: "Asia & Middle East",
    search: (q) => `https://www.noon.com/uae-en/search/?q=${e(q)}`,
  },

  /* ------------------------------------------------------------- Global */
  {
    id: "ebay",
    name: "eBay",
    region: "Worldwide",
    group: "Global",
    secondHand: true,
    search: (q) =>
      withTag(`https://www.ebay.com/sch/i.html?_nkw=${e(q)}`, "campid", AFFILIATE_TAGS.ebay),
  },
  {
    id: "aliexpress",
    name: "AliExpress",
    region: "Worldwide",
    group: "Global",
    search: (q) =>
      withTag(
        `https://www.aliexpress.com/wholesale?SearchText=${e(q)}`,
        "aff_platform",
        AFFILIATE_TAGS.aliexpress
      ),
  },
  {
    id: "temu",
    name: "Temu",
    region: "Worldwide",
    group: "Global",
    search: (q) => `https://www.temu.com/search_result.html?search_key=${e(q)}`,
  },
];

/** Picker order: keep Africa first, since that is the primary audience. */
export const SHOP_GROUPS: Shop["group"][] = [
  "Africa",
  "Americas",
  "Europe",
  "Asia & Middle East",
  "Global",
];

export const getShop = (id: string) => SHOPS.find((s) => s.id === id) ?? SHOPS[0];
