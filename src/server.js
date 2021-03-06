import hypernova, { serialize } from 'hypernova';

import {
  ServerModule,
  platformDynamicServer,
  INITIAL_CONFIG,
  PlatformState,
} from '@angular/platform-server';

import { BrowserModule } from '@angular/platform-browser';

import { NgModule, ApplicationRef } from '@angular/core';

import { first } from 'rxjs/operators';

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

export const renderAngular = (name, Component, Module) => hypernova({
  server() {
    return async (propsData) => {
      const ServerAppModule = getServerAppModule(Component, Module);

      const html = await renderServer(ServerAppModule, propsData);

      return serialize(name, html, propsData);
    };
  },

  client() {
    throw new Error('Use hypernova-angular instead');
  },
});
