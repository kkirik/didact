/** @jsx Didact.createElement */
import Didact, { IDidactElement } from '../packages/didact';

const element: IDidactElement = (
  <div style="background: salmon">
    <h1>Hello World</h1>
    <h2 style="text-align:right">from Didact</h2>
    <h3 style="text-align:right">from Didact3</h3>
  </div>
);

const container = document.querySelector('.root');

Didact.render(element, container);
