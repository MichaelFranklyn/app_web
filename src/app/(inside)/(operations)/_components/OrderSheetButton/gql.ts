import { gql } from "@apollo/client";

/**
 * Tudo o que a ficha offline precisa, em uma ida só: carteira, vínculos,
 * fábricas com prazos e níveis, e o catálogo com preço e imposto resolvidos.
 * É um payload grande (meio mega na carteira real, 49KB comprimido) e por isso
 * só sai no clique do botão — nunca junto com a tela.
 */
export const ORDER_SHEET_PACKAGE_QUERY = gql`
  query OrderSheetPackage($sellerId: UUID) {
    orderSheetPackage(sellerId: $sellerId) {
      generatedAt
      formatVersion
      companyId
      seller {
        id
        name
      }
      factories {
        id
        companyFactoryId
        name
        ipiInOrder
        deliveryEstimateDays
        minOrderAmount
        freeFreightCifAmount
        priceListIds
        paymentTerms {
          id
          name
          installmentsDays
          minOrderAmount
        }
        tiers {
          id
          name
        }
      }
      clients {
        id
        cnpj
        cnpjDigits
        razaoSocial
        nomeFantasia
        addressStreet
        addressNumber
        addressNeighborhood
        addressZip
        addressCity
        addressState
      }
      links {
        clientId
        factoryId
        tierId
        tierName
      }
      products {
        id
        factoryId
        sku
        name
        unitLabel
        unitPerPack
        saleMultiple
        ncm
        taxRate
        ipiRate
        prices {
          tierId
          tierName
          packPrice
          unitPrice
          isPromo
          promoEndsOn
        }
      }
    }
  }
`;

/** Vendedores da empresa — só o gestor escolhe de quem é a ficha. */
export const ORDER_SHEET_SELLERS_QUERY = gql`
  query OrderSheetSellers($input: BaseListInput!) {
    order_sheet_sellers: sellers(input: $input) {
      edges {
        node {
          id
          name
          isActive
        }
      }
      totalCount
    }
  }
`;
