# hypernova-angular

[Angular](https://angular.io/) bindings for [Hypernova](https://github.com/airbnb/hypernova).

On the server, wraps the component in a function to render it to a HTML string given its props.

On the client, calling this function with your component scans the DOM for any server-side rendered instances of it. It then resumes those components using the server-specified props.

## Install

```sh
npm install hypernova-angular
```

## Server Usage

Uses `renderAngular` to return hypernova bindings.

```ts
import { renderAngular } from 'hypernova-angular'

import { ExampleModule } from './components/example/example.module'
import { ExampleComponent } from './components/example/example.component'

hypernova({
  getComponent (name) {
    if (name === 'Example') {
      return renderAngular(name, ExampleComponent, ExampleModule)
    }
  }
}
```

## Browser Usage
You can use [Ara CLI](https://github.com/ara-framework/ara-cli) to support client-side rendering.

```bash
ara new:nova -t angular
```

Also, you can use the following configurations.

### App Module

The following code define a `AppModule` responsible of bootstrapping the Angular component in Hypernova placeholder.

- `Hypernova.Name`: Name of the component to bootstrap.
- `Hypernova.Node`: The placeholder where the component will be rendered.

```ts
import { NgModule, Inject } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { ExampleModule } from './components/example/example.module'
import { ExampleComponent } from './components/example/example.component';

const APP_ID = 'hypernova';

const components = {
  'Example': ExampleComponent
}

@NgModule({
  imports: [
    ExampleModule,
    BrowserModule.withServerTransition({ appId: APP_ID }),
  ],
  entryComponents: [ExampleComponent]
})
export class AppModule {
  constructor (
    @Inject('Hypernova.Name') private name: string,
    @Inject('Hypernova.Node') private node: HTMLElement
    ){}

  ngDoBootstrap(app) {
    const Component = components[this.name]
    if (Component) {
      return app.bootstrap(Component, this.node)
    }
  };
}
```

Use the `components` dictionary to support more components.

```ts
const components = {
  [Hypernova.Name]: AngularComponent
}
```

### Browser JIT

`browser.main.ts`
```ts
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app.module';
import { load, loadById, HypernovaModuleFactory } from 'hypernova-angular';

import { CompilerFactory, Compiler } from '@angular/core';

const platform = platformBrowserDynamic();

// Compile module (JIT)
const compilerFactory: CompilerFactory = platform.injector.get(CompilerFactory);

const compiler: Compiler = compilerFactory.createCompiler([])

const moduleFactory = compiler.compileModuleSync(AppModule);

const render = (name: string, placeholder: any) => {

  // Wrap module factory to provide necessary metadata to boostrap it.
  const hypernovaModuleFactory = new HypernovaModuleFactory(moduleFactory, name, placeholder);

  platform.bootstrapModuleFactory(hypernovaModuleFactory);
}

// Nova Bridge support
document.addEventListener('NovaMount', (event) => {
  const { name, id } = (<CustomEvent>event).detail;

  const placeholder = loadById(name, id);

  if (placeholder) {
    render(name, placeholder);
  }
})

// Render in placeholders rendered by Hypernova Server
load('Example').forEach(render.bind(this, 'Example'));
```

### Browser AOT

`browser.aot.main.ts`
```ts
import { platformBrowser } from '@angular/platform-browser';
import { AppModuleNgFactory } from './app.module.ngfactory';
import { load, loadById, HypernovaModuleFactory } from 'hypernova-angular';

enableProdMode();

const render = (name: string, placeholder: any) => {
  const hypernovaModuleFactory = new HypernovaModuleFactory(AppModuleNgFactory, name, placeholder);
  platformBrowser().bootstrapModuleFactory();
}

document.addEventListener('NovaMount', (event) => {
  const { name, id } = (<CustomEvent>event).detail;

  const placeholder = loadById(name, id);

  if (placeholder) {
    render(name, placeholder);
  }
})

load('Example').forEach(render.bind(this, 'Example'));
```