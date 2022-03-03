import data from "./address-data.json";
import { rawRecursiveGenerator } from "taio/esm/libs/custom/algorithms/recursive.mjs";

export interface AddressItem {
  code: string;
  name: string;
  spellCode: string;
  children?: AddressItem[];
}

export interface AddressIteration {
  node: AddressItem;
  path: AddressItem[];
}

export interface MatchFragment {
  text: string;
  matched: boolean;
}

export interface AddressSearchResult {
  fragments: MatchFragment[];
  addressInfo: AddressIteration;
}

export type PrefixProvider = (
  leafNode: AddressItem
) => IterableIterator<string>;

export type Char = string;
const isAlpha = (char: Char) => /\w/.test(char);
const isChinese = (char: Char) => /[\u4e00-\u9fa5]/.test(char);
const flattenAddress = rawRecursiveGenerator<
  [nodes: AddressItem[], path: AddressItem[]],
  AddressIteration
>(function* (nodes, path) {
  for (const node of nodes) {
    if (node.children) {
      yield this.sequence(node.children, [...path, node]);
    } else {
      yield this.value({
        path: [...path, node],
        node,
      });
    }
  }
});
interface CombinationMatchItem {
  prefixes: string[];
  levels: Record<number, boolean>;
}

function* prefixCombinations(
  subPath: AddressItem[],
  baseLevel: number,
  getPrefixes: PrefixProvider
): Generator<CombinationMatchItem, void, undefined> {
  const firstNode = subPath[0];
  if (!firstNode) {
    return;
  }
  const currentLevelInfo = { [baseLevel]: true };
  const currentLevelResults: CombinationMatchItem[] = [];
  for (const prefix of getPrefixes(firstNode)) {
    const matchItem: CombinationMatchItem = {
      prefixes: [prefix],
      levels: currentLevelInfo,
    };
    yield matchItem;
    currentLevelResults.push(matchItem);
  }
  yield* currentLevelResults;
  for (const childCombinations of prefixCombinations(
    subPath.slice(1),
    baseLevel + 1,
    getPrefixes
  )) {
    yield {
      levels: childCombinations.levels,
      prefixes: ["", ...childCombinations.prefixes],
    };
    for (const currentLevel of currentLevelResults) {
      yield {
        prefixes: [...currentLevel.prefixes, ...childCombinations.prefixes],
        levels: {
          ...currentLevel.levels,
          ...childCombinations.levels,
        },
      };
    }
  }
}

const suffixes = ["自治区", "特别行政区", ..."省市县区镇"];

const getNamePrefixes: PrefixProvider = function* ({ name }) {
  yield name;
  const totalLength = name.length;
  for (const suffix of suffixes) {
    if (name.endsWith(suffix)) {
      const endIndex = totalLength - suffix.length;
      yield name.slice(0, endIndex);
      break;
    }
  }
};

const getSpellCodePrefixes: PrefixProvider = function* ({ name, spellCode }) {
  yield spellCode;
  const totalLength = name.length;
  for (const suffix of suffixes) {
    if (name.endsWith(suffix)) {
      const endIndex = totalLength - suffix.length;
      yield spellCode.slice(0, endIndex);
      break;
    }
  }
};

export function* prefixQuery(
  input: string,
  getPrefixes: PrefixProvider,
  addressData: Iterable<AddressIteration>
) {
  for (const addressInfo of addressData) {
    const { path } = addressInfo;
    const combinations = prefixCombinations(path, 0, getPrefixes);
    for (const matchItem of combinations) {
      const prefixes = matchItem.prefixes;
      const totalPrefix = prefixes.join("");
      if (totalPrefix.startsWith(input)) {
        const levels = matchItem.levels;
        const fragments: MatchFragment[] = [];
        for (let i = 0; i < path.length; i++) {
          const node = path[i]!;
          if (!levels[i]) {
            fragments.push({
              matched: false,
              text: node.name,
            });
            continue;
          }
          const prefixLength = prefixes[i]!.length;
          const maxLevel = Math.max(
            ...Object.keys(levels).map((level) => +level)
          );
          const splitIndex =
            i === maxLevel
              ? prefixLength - totalPrefix.length + input.length
              : prefixLength;
          fragments.push(
            {
              matched: true,
              text: node.name.slice(0, splitIndex),
            },
            {
              matched: false,
              text: node.name.slice(splitIndex),
            }
          );
        }
        yield {
          addressInfo,
          fragments,
        };
        break;
      }
    }
  }
}

export function* queryAddress(
  input: string,
  addressData: AddressItem[] = data
) {
  const chars = [...input];
  if (chars.every(isAlpha)) {
    yield* prefixQuery(
      input.toUpperCase(),
      getSpellCodePrefixes,
      flattenAddress(addressData, [])
    );
  } else if (chars.every(isChinese)) {
    yield* prefixQuery(input, getNamePrefixes, flattenAddress(addressData, []));
  }
}

export function takeResult(
  iterator: IterableIterator<AddressSearchResult>,
  pageSize: number
): AddressSearchResult[] {
  const result: AddressSearchResult[] = [];
  for (let i = 0; i < pageSize; i++) {
    const iteration = iterator.next();
    if (iteration.done) {
      return result;
    }
    const newOption = iteration.value;
    result.push(newOption);
  }
  return result;
}
