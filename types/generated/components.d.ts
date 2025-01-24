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

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'basic-information.basic-information': BasicInformationBasicInformation;
      'stone-information.stone-information': StoneInformationStoneInformation;
    }
  }
}
