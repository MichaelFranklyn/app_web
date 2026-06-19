/**
 * Mock data para fábricas/fabricantes
 * Substituir por dados reais quando integrar com API
 */

export const MOCK_FACTORY = {
  id: "fabrica-001",
  name: "Cimento Norte S.A.",
  email: "comercial@cimentonorte.com.br",
  cnpj: "12.345.678/0001-90",
  address: "Av. Industrial, 1000 - São Paulo, SP",
  phone: "+55 11 3000-1000",
  status: "Ativo"
};

export const MOCK_FACTORY_PRODUCTS = [
  {
    sku: "CIM-CPII-50",
    name: "Cimento CP-II 50kg",
    category: "Cimento",
    pack: "Saco 50kg",
    status: "Ativo"
  },
  {
    sku: "CIM-CPIII-50",
    name: "Cimento CP-III 50kg",
    category: "Cimento",
    pack: "Saco 50kg",
    status: "Ativo"
  },
  {
    sku: "ARG-ACII-20",
    name: "Argamassa AC-II 20kg",
    category: "Argamassa",
    pack: "Saco 20kg",
    status: "Ativo"
  },
  {
    sku: "ARG-ACIII-20",
    name: "Argamassa AC-III 20kg",
    category: "Argamassa",
    pack: "Saco 20kg",
    status: "Ativo"
  },
  {
    sku: "REV-TEX-5",
    name: "Revestimento Texturado 5kg",
    category: "Revestimento",
    pack: "Balde 5kg",
    status: "Inativo"
  }
];

export const MOCK_FACTORY_PRICING = [
  {
    sku: "CIM-CPII-50",
    name: "Cimento CP-II 50kg",
    price: "R$ 38,00",
    minQty: "50 sacos"
  },
  {
    sku: "ARG-ACII-20",
    name: "Argamassa AC-II 20kg",
    price: "R$ 24,00",
    minQty: "30 sacos"
  }
];
