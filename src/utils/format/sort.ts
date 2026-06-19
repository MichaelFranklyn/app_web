const defaultCollator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
});

export interface SortBuilder<T> {
  byKey(k: string): SortBuilder<T>;
  inKey(k: string): SortBuilder<T>;
  asc(): SortedArray<T>;
  desc(): SortedArray<T>;
  as(...valuesInOrder: string[]): SortedArray<T>;
}

export type SortedArray<T> = T[] & {
  thenByKey(k: string): SortBuilder<T>;
};

type SortRule = {
  path: string[];
  direction: 'asc' | 'desc';
  rank?: Map<unknown, number>;
};

export function sortObjectsInArray<T>(array: T[]): SortBuilder<T> {
  const rules: SortRule[] = [];
  let currentPath: string[] = [];

  const getValue = (obj: unknown, path: string[]): unknown => {
    if (path.length === 1) {
      return (obj as Record<string, unknown>)?.[path[0]];
    }

    return path.reduce((acc, currentKey) => {
      if (acc && typeof acc === 'object') {
        return (acc as Record<string, unknown>)[currentKey];
      }
      return undefined;
    }, obj);
  };

  const compareValues = (a: unknown, b: unknown): number => {
    if (a === b) return 0;

    if (typeof a === 'string' && typeof b === 'string') {
      return defaultCollator.compare(a, b);
    }
    if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    }
    if (a instanceof Date && b instanceof Date) {
      return a.getTime() - b.getTime();
    }
    if (typeof a === 'boolean' && typeof b === 'boolean') {
      return a === b ? 0 : a ? 1 : -1;
    }

    return defaultCollator.compare(String(a), String(b));
  };

  const executeSort = (): SortedArray<T> => {
    if (!Array.isArray(array) || array.length === 0) return augmentArray([]);
    if (rules.length === 0) return augmentArray([...array]);

    const sorted = [...array].sort((a, b) => {
      for (const rule of rules) {
        const valA = getValue(a, rule.path);
        const valB = getValue(b, rule.path);

        const isNullishA = valA === null || valA === undefined;
        const isNullishB = valB === null || valB === undefined;

        if (isNullishA && isNullishB) {
          continue;
        }

        if (isNullishA) {
          return 1;
        }

        if (isNullishB) {
          return -1;
        }

        let result = 0;

        if (rule.rank) {
          const ra = rule.rank.get(valA) ?? Number.POSITIVE_INFINITY;
          const rb = rule.rank.get(valB) ?? Number.POSITIVE_INFINITY;
          result = ra - rb;
        } else {
          result = compareValues(valA, valB);

          if (rule.direction === 'desc') {
            result = -result;
          }
        }

        if (result !== 0) {
          return result;
        }
      }
      return 0;
    });

    return augmentArray(sorted);
  };

  const augmentArray = (arr: T[]): SortedArray<T> => {
    const augmented = arr as SortedArray<T>;
    augmented.thenByKey = (k: string) => {
      currentPath = [k];
      return builder;
    };
    return augmented;
  };

  const builder: SortBuilder<T> = {
    byKey(k: string) {
      rules.length = 0;
      currentPath = [k];
      return this;
    },

    inKey(k: string) {
      currentPath.push(k);
      return this;
    },

    asc() {
      rules.push({ path: [...currentPath], direction: 'asc' });
      currentPath = [];
      return executeSort();
    },

    desc() {
      rules.push({ path: [...currentPath], direction: 'desc' });
      currentPath = [];
      return executeSort();
    },

    as(...valuesInOrder: string[]) {
      const rank = new Map<unknown, number>(valuesInOrder.map((v, i) => [v, i]));
      rules.push({ path: [...currentPath], direction: 'asc', rank });
      currentPath = [];
      return executeSort();
    },
  };

  return builder;
}
