/* Product catalogue for /shop.
   DEMO DATA: these are sample products and prices for previewing the layout.
   Replace with the real stock list (name, size, price, usage, safety info)
   before the shop goes public — Brand Book p.8: "list what is actually stocked". */

export type Product = {
  id: string;
  name: string;
  category: string;
  size: string;
  description: string;
  usage: string;
  /** Safety / storage note, shown where relevant (Brand Book p.14). */
  caution?: string;
  /** Price in naira. */
  price: number;
  inStock: boolean;
  /** Product photo. Temporary Unsplash images until real pack shots are supplied. */
  image?: ProductImage;
};

export type ProductImage = {
  src: string;
  /** Unsplash photographer, for credit. */
  credit: string;
  /** CSS object-position to keep the subject in frame. */
  position?: string;
};


export const PRODUCTS: Product[] = [
  {
    id: "liquid-detergent-2l",
    name: "Liquid Laundry Detergent",
    category: "Detergents",
    size: "2 litres",
    description: "Everyday liquid detergent for machine and hand washing of washable fabrics.",
    usage: "Use one cap per normal load. Pre-treat heavy stains with a little neat liquid.",
    caution: "Keep out of reach of children. Avoid contact with eyes.",
    price: 6500,
    inStock: true,
    image: { src: "/images/products/liquid-detergent.jpg", credit: "Sufyan" },
  },
  {
    id: "powder-detergent-1kg",
    name: "Powder Detergent",
    category: "Detergents",
    size: "1 kg",
    description: "Concentrated washing powder for whites and colourfast items.",
    usage: "Dissolve two scoops in water before adding garments.",
    caution: "Keep dry and sealed. Keep out of reach of children.",
    price: 3200,
    inStock: true,
    image: { src: "/images/products/powder-detergent.jpg", credit: "HowToGym" },
  },
  {
    id: "fabric-softener-1l",
    name: "Fabric Softener",
    category: "Fabric care",
    size: "1 litre",
    description: "Leaves washed garments soft and easier to iron.",
    usage: "Add one cap to the final rinse. Do not pour directly onto fabric.",
    price: 4000,
    inStock: true,
    image: { src: "/images/products/fabric-softener-pour.jpg", credit: "No Revisions" },
  },
  {
    id: "stain-remover-500ml",
    name: "Stain Remover Spray",
    category: "Fabric care",
    size: "500 ml",
    description: "Pre-wash spray for common food, grease and collar stains.",
    usage: "Test on a hidden area first. Spray, leave for 5 minutes, then wash as normal.",
    caution: "Not suitable for silk, wool or leather.",
    price: 3800,
    inStock: false,
    image: { src: "/images/products/stain-remover.jpg", credit: "Brett Jordan" },
  },
  {
    id: "starch-spray-400ml",
    name: "Ironing Starch Spray",
    category: "Fabric care",
    size: "400 ml",
    description: "Gives shirts, native wear and linens a crisp, neat finish.",
    usage: "Shake well and spray lightly from 20 cm before ironing.",
    caution: "Pressurised container. Keep away from heat.",
    price: 2500,
    inStock: true,
    image: { src: "/images/products/starch-spray.jpg", credit: "Annie Spratt" },
  },
  {
    id: "surface-disinfectant-1l",
    name: "Multi-surface Disinfectant",
    category: "Disinfectants",
    size: "1 litre",
    description: "For cleaning hard surfaces in homes, offices and shared spaces.",
    usage: "Dilute as directed on the label. Wipe and allow to air dry.",
    caution: "Do not mix with other cleaning products. Store in a cool place.",
    price: 4500,
    inStock: true,
    image: { src: "/images/products/surface-disinfectant.jpg", credit: "Towfiqu barbhuiya" },
  },
  {
    id: "microfibre-cloths-5",
    name: "Microfibre Cleaning Cloths",
    category: "Cleaning tools",
    size: "Pack of 5",
    description: "Reusable, lint-free cloths for dusting, glass and surfaces.",
    usage: "Use damp or dry. Machine washable; avoid fabric softener.",
    price: 3000,
    inStock: true,
    image: { src: "/images/products/microfibre-cloths.jpg", credit: "GoGoNano" },
  },
  {
    id: "rubber-gloves",
    name: "Household Rubber Gloves",
    category: "Protective accessories",
    size: "1 pair · medium",
    description: "Protect hands while cleaning or handling detergents.",
    usage: "Rinse and dry inside out after use.",
    price: 1500,
    inStock: true,
    image: { src: "/images/products/rubber-gloves.jpg", credit: "Karolina Kołodziejczak" },
  },
];

/** Chips shown when the search box is opened and empty. */
export const SUGGESTED_SEARCHES = [
  "Detergent",
  "Fabric softener",
  "Stain remover",
  "Disinfectant",
  "Microfibre cloths",
  "Gloves",
];

export const formatNaira =(amount: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(amount);
