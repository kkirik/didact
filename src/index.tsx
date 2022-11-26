/** @jsx Didact.createElement */
import Didact, {DidactElement} from '../packages/didact';
// import React from 'react';
// import {createRoot} from 'react-dom/client';

const element: DidactElement = (
  <div style="background: salmon">
    <h1>Hello World</h1>
    <h2 style="text-align:right">from Didact</h2>
    <h3 style="text-align:right">from Didact3</h3>
  </div>
);

const newElement: DidactElement = (
  <div style="background: lightblue">
    <h1>Hello World 2</h1>
    <h2 style="text-alignpm:left">from Didact</h2>
  </div>
);

const reactElement = (
  <div style={{background: 'salmon'}}>
    <h1>Hello World</h1>
    <h2 style={{textAlign: 'right'}}>from Didact</h2>
    <h3 style={{textAlign: 'right'}}>from Didact3</h3>
  </div>
);

const newReactElement = (
  <div style={{background: 'lightblue'}}>
    <h1>Hello World 2</h1>
    <h2 style={{textAlign: 'left'}}>from Didact</h2>
  </div>
);

const container = document.querySelector('.root')!;

const App = ({name}) => {
  return <h1>Hi {name}</h1>;
};

Didact.render(<App name="foo" />, container);

// react

// const root = createRoot(container);

// root.render(reactElement);
// root.render(newReactElement);
