/**
 * @link {https://site-chi-orcin.now.sh/build-your-own-react/}
 */

export interface DidactElement {
  type: string;
  props: {
    [key: string]: any;
    children: DidactElement[];
    nodeValue?: string;
  };
}

export interface UnitOfWork {
  type: string;
  dom?: Element | Text;
  parent?: UnitOfWork;
  child?: UnitOfWork;
  sibling?: UnitOfWork;
  props: {
    children: UnitOfWork[];
  };
}

function createTextElement(text: string): DidactElement {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

function createElement(
  type: string,
  props?: Record<string, any>,
  ...children: (string | DidactElement)[]
): DidactElement {
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

function render(element: UnitOfWork, container: Element | Text) {
  const dom =
    element.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(element.type);

  element.props.children.forEach((child) => {
    render(child, dom);
  });

  const isNodeProperty = (key) => key !== 'children';

  Object.keys(element.props)
    .filter(isNodeProperty)
    .forEach((name) => {
      dom[name] = element.props[name];
    });

  container.appendChild(dom);
}

let nextUnitOfWork: UnitOfWork | null = null;

function workLoop(deadline: IdleDeadline) {
  let shouldYield = false;

  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function performUnitOfWork(fiber: UnitOfWork): UnitOfWork | null {
  // TODO
  return null;
}

const Didact = {
  render,
  createElement,
};

export default Didact;
