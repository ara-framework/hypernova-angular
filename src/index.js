import { findNode, getData } from 'nova-helpers';

export { load } from 'hypernova';

export { HypernovaModuleFactory, HYPERNOVA_DATA } from './hypernova.module.factory';

export const loadById = (name, id) => {
  const node = findNode(name, id);
  const data = getData(name, id);

  if (node && data) {
    return {
      node,
      data,
    };
  }

  return null;
};
