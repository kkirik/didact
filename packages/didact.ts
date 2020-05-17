export interface IDidactElement {
  type: string;
  props: {
    [key: string]: any;
    children: IDidactElement[];
    nodeValue?: string;
  };
}

export interface IFiberNode {
  dom: Text | HTMLElement | Element;
  parent?: IFiberNode;
  child?: IFiberNode;
  sibling?: IFiberNode;
  type?: string;
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

function createDom(fiber: IFiberNode) {
  const dom =
    fiber.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(fiber.type);

  const isChildren = (prop) => prop !== 'children';
  Object.keys(fiber.props)
    .filter(isChildren)
    .forEach((prop) => {
      dom[prop] = fiber.props[prop];
    });

  return dom;
}

function render(element: IDidactElement, container: Text | HTMLElement | Element) {
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element],
    },
  };
}

let nextUnitOfWork: IFiberNode | null = null;

function workLoop(deadline: IdleDeadline) {
  let shouldYield = false;

  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  requestIdleCallback(workLoop);
}

function performUnitOfWork(fiber: IFiberNode) {
  // TODO add dom node
  // TODO create new fibers
  // TODO return next unit of work

  // TODO add dom node
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  if (fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom);
  }

  // TODO create new fibers
  const elements = fiber.props.children;
  let index = 0;
  let prevSibling: IFiberNode = null;

  while (index < elements.length) {
    const element = elements[index];

    const newFiber: IFiberNode = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    };

    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }

  // TODO return next unit of work
  if (fiber.child) {
    return fiber.child;
  }

  let nextFiber = fiber;

  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }

    nextFiber = nextFiber.parent;
  }
}

requestIdleCallback(workLoop);

const Didact = {
  render,
  createElement,
};

export default Didact;
