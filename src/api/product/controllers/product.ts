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
  const gstPrice =
    (product.gst / 100) *
    (itemBasePrice + valueAdditionPrice + otherStonePrice);
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
        { ...ctx, query: queryWithoutSort },
        {
          populate: {
            material_type: true, // Ensure the material_type relationship is populated
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
            (minPrice ? price >= parseFloat(minPrice.toString()) : true) &&
            (maxPrice ? price <= parseFloat(maxPrice.toString()) : true)
          );
        });
      }

      // Custom sorting logic on the filtered products
      if (sort && typeof sort === "string") {
        const [field, order] = sort.split(":");

        // If sorting by calculatedPrice, use custom logic
        if (
          field === "calculatedPrice" &&
          (order === "asc" || order === "desc")
        ) {
          filteredProducts.sort((a, b) => {
            const priceA = a.calculatedPrice;
            const priceB = b.calculatedPrice;
            return order === "desc" ? priceB - priceA : priceA - priceB;
          });
        } else {
          // Generic sort on the filtered list based on the field
          filteredProducts.sort((a, b) => {
            // Get the values to compare. Adjust this if nested properties need to be sorted.
            const valueA = a[field];
            const valueB = b[field];

            // Ensure a basic comparison works even if the values are booleans or numbers
            if (order === "desc") {
              return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
            } else {
              return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
            }
          });
        }
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
