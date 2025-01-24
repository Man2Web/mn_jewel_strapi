/**
 * product controller
 */

import { factories } from "@strapi/strapi";

// Calculate dynamic prices for each product
const calculatePrice = (product) => {
  const materialType = product.material_type; // Get material_type from populated data
  const itemBasePrice = product.item_Net_Weight * materialType.price;
  const valueAdditionPrice = (product.value_Addition / 100) * itemBasePrice;
  const otherStonePrice = product.stone_information.reduce((total, item) => {
    return total + item.stone_price;
  }, 0);
  const gstPrice = (product.gst / 100) * (itemBasePrice + valueAdditionPrice);
  const totalPrice =
    itemBasePrice + valueAdditionPrice + otherStonePrice + gstPrice;
  return totalPrice;
};

export default factories.createCoreController(
  "api::product.product",
  ({ strapi }) => ({
    async find(ctx) {
      const { query } = ctx;
      const { minPrice, maxPrice, sort } = query;

      // Remove the 'sort' key from the query before passing it to `super.find`
      const { sort: _, ...queryWithoutSort } = query;

      // Fetch products with related material_type data populated
      let { data, meta } = await super.find(
        { ...ctx, query: queryWithoutSort }, // Updated query without `sort`
        {
          populate: {
            material_type: true, // Assuming 'material_type' is the relationship field in the Product model
          },
        }
      );

      // Calculate dynamic prices for each product
      const productsWithPrice = data.map((product) => ({
        ...product,
        calculatedPrice: calculatePrice(product),
      }));

      // Filter products by price range
      let filteredProducts = productsWithPrice;
      if (minPrice || maxPrice) {
        filteredProducts = filteredProducts.filter((product) => {
          const price = product.calculatedPrice;
          return (
            (minPrice ? price >= parseFloat(minPrice as string) : true) &&
            (maxPrice ? price <= parseFloat(maxPrice as string) : true)
          );
        });
      }

      // Custom sorting logic
      if (sort && typeof sort === "string") {
        const [field, order] = sort.split(":");

        // Check if sorting is requested for "calculatedPrice"
        if (
          field === "calculatedPrice" &&
          (order === "asc" || order === "desc")
        ) {
          filteredProducts.sort((a, b) => {
            const priceA = a.calculatedPrice;
            const priceB = b.calculatedPrice;

            // Ascending: Smallest to Largest, Descending: Largest to Smallest
            return order === "desc" ? priceB - priceA : priceA - priceB;
          });
        } else {
          // Default Strapi sorting
          const sortedProducts = await super.find(ctx, {
            sort: { [field]: order },
          });
          filteredProducts = sortedProducts.data.map((product) => ({
            ...product,
            calculatedPrice: calculatePrice(product),
          }));
        }
      } else {
        // Default Strapi sorting
        const sortedProducts = await super.find(ctx);
        filteredProducts = sortedProducts.data.map((product) => ({
          ...product,
          calculatedPrice: calculatePrice(product),
        }));
      }

      // Return the filtered and sorted products
      return {
        data: filteredProducts,
        meta,
      };
    },

    async findOne(ctx) {
      const { id } = ctx.params;

      // Fetch the product with related material_type data populated
      const { data } = await super.findOne(ctx, {
        populate: {
          material_type: true, // Assuming 'material_type' is the relationship field in the Product model
        },
      });

      const productWithPrice = {
        ...data,
        calculatedPrice: calculatePrice(data),
      };

      // Return the product with calculated price
      return {
        data: productWithPrice,
      };
    },
  })
);
