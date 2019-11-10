import hypernova, { serialize, load } from 'hypernova';
import { first } from 'rxjs/operators';
import { BrowserModule } from '@angular/platform-browser';
import {
  ServerModule,
  platformDynamicServer,
  INITIAL_CONFIG,
  PlatformState,
} from '@angular/platform-server';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { NgModule, ApplicationRef } from '@angular/core';

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

const getServerAppModule = (Component, Module) => {
  function AppModule() {
    this.ngDoBootstrap = (app) => {
      app.bootstrap(Component, `#${APP_ID}`);
    };
  }
  return NgModule({
    imports: [
      Module,
      BrowserModule,
      ServerModule,
    ],
    entryComponents: [Component],
  })(AppModule);
};

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

const renderServer = (ServerAppModule, propsData) => {
  const platform = platformDynamicServer([
    {
      provide: INITIAL_CONFIG,
      useValue: {
        document: `<div id="${APP_ID}"></div>`,
      },
    },
    {
      provide: HYPERNOVA_DATA,
      useValue: propsData,
    },
  ]);

  return platform.bootstrapModule(ServerAppModule)
    .then((moduleRef) => {
      const applicationRef = moduleRef.injector.get(ApplicationRef);
      return applicationRef.isStable.pipe(first(isStable => isStable))
        .toPromise()
        .then(() => {
          const platformState = platform.injector.get(PlatformState);

          platform.destroy();
          return platformState.getDocument().getElementById(APP_ID).serialize();
        });
    });
};

export const mountComponent = (Component, Module, node, propsData) => {
  const BrowserAppModule = getBrowserAppModule(Component, Module, node, propsData);

  platformBrowserDynamic().bootstrapModule(BrowserAppModule);
};

export const renderAngular = (name, Component, Module) => hypernova({
  server() {
    return async (propsData) => {
      const ServerAppModule = getServerAppModule(Component, Module);

      const html = await renderServer(ServerAppModule, propsData);

      return serialize(name, html, propsData);
    };
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
