# hypernova-angular

[Angular](https://angular.io/) bindings for [Hypernova](https://github.com/airbnb/hypernova).

On the server, wraps the component in a function to render it to a HTML string given its props.

On the client, calling this function with your component scans the DOM for any server-side rendered instances of it. It then resumes those components using the server-specified props.

## Install

```sh
npm install hypernova-angular
```

## Usage

Here's how to use it in your browser module:

```ts
import { renderAngular } from 'hypernova-angular'

import { ExampleModule } from './components/example/example.module'
import { ExampleComponent } from './components/example/example.component'

renderAngular('Example', ExampleComponent, ExampleModule)
```