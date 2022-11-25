/**
 * @link {https://site-chi-orcin.now.sh/build-your-own-react/}
 */

interface Props {
  children: FiberNode[];
}

export interface DidactElement {
  type: string;
  props: {
    [key: string]: any;
    children: DidactElement[];
    nodeValue?: string;
  };
}

interface RootUnitOfWork {
  props: Props;
  dom?: Element | Text;
  child?: FiberNode;
}

interface FiberNode {
  type: keyof HTMLElementTagNameMap | 'TEXT_ELEMENT';
  props: Props;
  parent: UnitOfWork;
  child?: FiberNode;
  sibling?: FiberNode;
  dom?: Element | Text;
}

export type UnitOfWork = RootUnitOfWork | FiberNode;

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

function createDomNode(fiber: FiberNode) {
  const dom =
    fiber.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(fiber.type);

  fiber.props.children.forEach((child) => {
    render(child, dom);
  });

  const isNodeProperty = (key) => key !== 'children';

  Object.keys(fiber.props)
    .filter(isNodeProperty)
    .forEach((name) => {
      dom[name] = fiber.props[name];
    });

  return dom;
}

let nextUnitOfWork: UnitOfWork | null = null;
let wipRoot: UnitOfWork | null = null;

function render(element: FiberNode, container: Element | Text) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
  };

  nextUnitOfWork = wipRoot;
}

function commitRoot() {
  // TODO add nodes to dom
}

function workLoop(deadline: IdleDeadline) {
  let shouldYield = false;

  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);

    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function performUnitOfWork(fiber: UnitOfWork): UnitOfWork | null {
  /** isn't root fiber node */
  if ('type' in fiber && !fiber.dom) {
    fiber.dom = createDomNode(fiber);
  }

  const elements = fiber.props.children;

  let index = 0;
  let prevSibling: FiberNode | undefined = undefined;

  while (index < elements.length) {
    const element = elements[index];

    const newFiber: FiberNode = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: undefined,
    };

    if (index === 0) {
      fiber.child = newFiber;
    } else if (prevSibling) {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }

  if (fiber.child) {
    return fiber.child;
  }

  let nextFiber: UnitOfWork | null = fiber;

  while (nextFiber) {
    if ('sibling' in nextFiber && nextFiber.sibling) {
      return nextFiber.sibling;
    }

    if ('parent' in nextFiber) {
      nextFiber = nextFiber?.parent;
    } else {
      nextFiber = null;
    }
  }

  return null;
}

const Didact = {
  render,
  createElement,
};

export default Didact;
