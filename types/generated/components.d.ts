import type { Schema, Struct } from '@strapi/strapi';

export interface BasicInformationBasicInformation
  extends Struct.ComponentSchema {
  collectionName: 'components_basic_information_basic_informations';
  info: {
    displayName: 'Basic Information';
  };
  attributes: {
    gross_Weight: Schema.Attribute.Decimal & Schema.Attribute.Required;
    Height: Schema.Attribute.Decimal & Schema.Attribute.Required;
    material: Schema.Attribute.Enumeration<['Gold', 'Silver']> &
      Schema.Attribute.Required;
    material_type: Schema.Attribute.Relation<
      'oneToOne',
      'api::material-type.material-type'
    >;
    metal_Purity: Schema.Attribute.Enumeration<
      ['Gold_24K', 'Gold_22K', 'Gold_18K']
    > &
      Schema.Attribute.Required;
  };
}

export interface ProductProduct extends Struct.ComponentSchema {
  collectionName: 'components_product_products';
  info: {
    description: '';
    displayName: 'product';
  };
  attributes: {
    product: Schema.Attribute.Relation<'oneToOne', 'api::product.product'>;
    productPrice: Schema.Attribute.Decimal & Schema.Attribute.Required;
    quantity: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
  };
}

export interface StoneInformationStoneInformation
  extends Struct.ComponentSchema {
  collectionName: 'components_stone_information_stone_informations';
  info: {
    description: '';
    displayName: 'Stone-Information';
  };
  attributes: {
    stone_name: Schema.Attribute.String & Schema.Attribute.Required;
    stone_price: Schema.Attribute.Decimal & Schema.Attribute.Required;
    stone_weight: Schema.Attribute.Decimal & Schema.Attribute.Required;
  };
}

export interface UserAddressUserAddress extends Struct.ComponentSchema {
  collectionName: 'components_user_address_user_addresses';
  info: {
    displayName: 'User Address';
  };
  attributes: {
    address: Schema.Attribute.Text & Schema.Attribute.Required;
    city: Schema.Attribute.String & Schema.Attribute.Required;
    email: Schema.Attribute.Email & Schema.Attribute.Required;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    phoneNumber: Schema.Attribute.BigInteger &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: '10';
          min: '10';
        },
        string
      >;
    pincode: Schema.Attribute.BigInteger & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'basic-information.basic-information': BasicInformationBasicInformation;
      'product.product': ProductProduct;
      'stone-information.stone-information': StoneInformationStoneInformation;
      'user-address.user-address': UserAddressUserAddress;
    }
  }
}
