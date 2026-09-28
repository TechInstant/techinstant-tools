/**
 * Search links for the shopping checklists.
 *
 * These are plain search URLs, built in the browser at the moment you click.
 * We deliberately do not pre-load a basket or hit any retailer API: that would
 * need credentials, and it would mean sending your list to a third party, which
 * is exactly what these tools promise not to do.
 */

export interface Shop {
  id: string;
  name: string;
  /** Shown so people can tell which storefront they are being sent to. */
  region: string;
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
  amazonCom: "",
  amazonCoUk: "",
  jumia: "",
};

export const AFFILIATE_DISCLOSURE = Object.values(AFFILIATE_TAGS).some(Boolean);

const withTag = (url: string, param: string, tag: string) =>
  tag ? `${url}&${param}=${encodeURIComponent(tag)}` : url;

export const SHOPS: Shop[] = [
  {
    id: "jumia-ng",
    name: "Jumia",
    region: "Nigeria",
    search: (q) =>
      withTag(
        `https://www.jumia.com.ng/catalog/?q=${encodeURIComponent(q)}`,
        "utm_source",
        AFFILIATE_TAGS.jumia
      ),
  },
  {
    id: "amazon-com",
    name: "Amazon",
    region: "United States",
    search: (q) =>
      withTag(
        `https://www.amazon.com/s?k=${encodeURIComponent(q)}`,
        "tag",
        AFFILIATE_TAGS.amazonCom
      ),
  },
  {
    id: "amazon-uk",
    name: "Amazon",
    region: "United Kingdom",
    search: (q) =>
      withTag(
        `https://www.amazon.co.uk/s?k=${encodeURIComponent(q)}`,
        "tag",
        AFFILIATE_TAGS.amazonCoUk
      ),
  },
];

export const getShop = (id: string) => SHOPS.find((s) => s.id === id) ?? SHOPS[0];
