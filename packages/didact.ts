const Didact = {
  render,
  createElement,
};

export interface IDidactElement {
  type: string;
  props: {
    [key: string]: any;
    children: IDidactElement[];
    nodeValue?: string;
  };
}

export interface IUnitOfWork {
  type?: string;
  dom?: Element | Text;
  parent?: IUnitOfWork;
  child?: IUnitOfWork;
  sibling?: IUnitOfWork;
  props: {
    children: IUnitOfWork[];
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

function createElement(
  type: string,
  props?: { [key: string]: any },
  ...children: (string | IDidactElement)[]
): IDidactElement {
  return {
    type,
    props: {
      ...props,
      children: children.map(child =>
        typeof child === 'object' ? child : createTextElement(child)
      ),
    },
  };
}

function createDom(fiber: IUnitOfWork) {
  const dom =
    fiber.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(fiber.type);

  Object.entries(fiber.props)
    .filter(([key]) => key !== 'children')
    .forEach(([key, value]) => {
      dom[key] = value;
    });

  return dom;
}

function render(element: IUnitOfWork, container: Element | Text) {
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element],
    },
  };
}

let nextUnitOfWork: IUnitOfWork;

function workLoop(deadline: IdleDeadline) {
  let shouldYield = false;

  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

// 1. TODO add dom node
// 2. TODO create new fibers
// 3. TODO return next unit of work

function performUnitOfWork(fiber: IUnitOfWork) {
  //1. TODO add dom node

  if (!fiber.dom) {
    console.log(fiber);

    fiber.dom = createDom(fiber);
  }

  if (fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom);
  }

  // 2. TODO create new fibers

  const elements = fiber.props.children;
  let index = 0;
  let prevSibling: IUnitOfWork;

  while (index < elements.length) {
    const element = elements[index];
    const newFiber: IUnitOfWork = {
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

  // 3. TODO return next unit of work

  if (fiber.child) return fiber.child;

  let nextFiber = fiber;

  while (nextFiber) {
    if (nextFiber.sibling) return nextFiber.sibling;

    nextFiber = nextFiber.parent;
  }
}

export default Didact;
