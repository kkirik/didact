export interface IDidactElement {
  type: string;
  props: {
    [key: string]: any;
    children: IDidactElement[];
    nodeValue?: string;
  };
}

function createElement(
  type: string,
  props?: { [key: string]: any },
  ...children: (string | IDidactElement)[]
): IDidactElement {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === 'object' ? child : createTextElement(child)
      ),
    },
  };
}

function createTextElement(text: string): IDidactElement {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

function render(element: IDidactElement, container: Text | HTMLElement) {
  const dom =
    element.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(element.type);

  const isChildren = (prop) => prop !== 'children';
  Object.keys(element.props)
    .filter(isChildren)
    .forEach((prop) => {
      dom[prop] = element.props[prop];
    });

  element.props.children.forEach((child) => render(child, dom));

  container.appendChild(dom);
}

const Didact = {
  render,
  createElement,
};

export default Didact;
