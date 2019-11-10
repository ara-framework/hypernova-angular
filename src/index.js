import hypernova, { load } from 'hypernova';
import { BrowserModule } from '@angular/platform-browser';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { NgModule } from '@angular/core';

import { findNode, getData } from 'nova-helpers';

export { load } from 'hypernova';

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

const APP_ID = 'hypernova';

export const HYPERNOVA_DATA = 'Hypernova.Data';

const getBrowserAppModule = (Component, Module, node, propsData) => {
  function AppModule() {
    this.ngDoBootstrap = (app) => {
      app.bootstrap(Component, node);
    };
  }
  return NgModule({
    imports: [
      Module,
      BrowserModule.withServerTransition({ appId: APP_ID }),
    ],
    entryComponents: [Component],
    providers: [
      {
        provide: HYPERNOVA_DATA,
        useValue: propsData,
      },
    ],
  })(AppModule);
};

export const mountComponent = (Component, Module, node, propsData) => {
  const BrowserAppModule = getBrowserAppModule(Component, Module, node, propsData);

  platformBrowserDynamic().bootstrapModule(BrowserAppModule);
};

export const renderAngular = (name, Component, Module) => hypernova({
  server() {
    throw new Error('Use hypernova-angular/server instead');
  },

  client() {
    const payloads = load(name);
    if (payloads) {
      payloads.forEach((payload) => {
        const { node, data: propsData } = payload;

        mountComponent(Component, Module, node, propsData);
      });
    }
    return Component;
  },
});
