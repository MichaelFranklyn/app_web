import { gql } from "@apollo/client";
import { beforeEach, describe, expect, it } from "vitest";
import {
  hasInvalidatedField,
  markFieldsInvalidated,
  resetInvalidatedFields,
  rootFieldNames,
} from "./cacheSeed";

const ORDERS = gql`
  query Orders($input: BaseListInput) {
    orders_list: orders(input: $input) {
      totalCount
    }
  }
`;

const DETAIL = gql`
  query OrderDetail($id: ID!) {
    order(id: $id) {
      data {
        id
      }
    }
    orderStats {
      total
    }
  }
`;

describe("rootFieldNames", () => {
  it("usa o nome do SCHEMA, não o alias do documento", () => {
    expect(rootFieldNames(ORDERS)).toEqual(["orders"]);
  });

  it("devolve todos os campos de topo do documento", () => {
    expect(rootFieldNames(DETAIL)).toEqual(["order", "orderStats"]);
  });
});

describe("registro de campos invalidados", () => {
  beforeEach(() => resetInvalidatedFields());

  it("começa vazio", () => {
    expect(hasInvalidatedField(["orders"])).toBe(false);
  });

  it("acusa o campo que a mutation invalidou", () => {
    markFieldsInvalidated(["orders", "orderStats"]);
    expect(hasInvalidatedField(["orders"])).toBe(true);
    expect(hasInvalidatedField(["clients"])).toBe(false);
  });

  it("basta UM campo do documento ter sido invalidado", () => {
    markFieldsInvalidated(["orderStats"]);
    expect(hasInvalidatedField(rootFieldNames(DETAIL))).toBe(true);
  });

  it("ignora nome vazio", () => {
    markFieldsInvalidated([""]);
    expect(hasInvalidatedField([""])).toBe(false);
  });
});
