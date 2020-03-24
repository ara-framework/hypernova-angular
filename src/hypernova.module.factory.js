import { NgModuleFactory, ReflectiveInjector } from '@angular/core';

export const HYPERNOVA_DATA = 'Hypernova.Data';

export class HypernovaModuleFactory extends NgModuleFactory {
  constructor(moduleFactory, name, placeholder) {
    super();
    this.name = name;
    this.placeholder = placeholder;
    this.moduleFactory = moduleFactory;
    this.moduleType = moduleFactory.moduleType;

    this.create = (parentInjector) => {
      const newInjector = ReflectiveInjector.resolveAndCreate([
        {
          provide: 'Hypernova.Data',
          useValue: this.placeholder.data,
        },
        {
          provide: 'Hypernova.Name',
          useValue: this.name,
        },
        {
          provide: 'Hypernova.Node',
          useValue: this.placeholder.node,
        },
      ], parentInjector);

      return this.moduleFactory.create(newInjector);
    };
  }
}
