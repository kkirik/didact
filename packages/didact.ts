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

interface RootUnitOfWork {
  dom?: Element | Text;
  child?: FiberNode;
  props: {
    children: FiberNode[];
  };
}

interface FiberNode {
  type: keyof HTMLElementTagNameMap | 'TEXT_ELEMENT';
  dom?: Element | Text;
  parent?: UnitOfWork;
  child?: FiberNode;
  sibling?: FiberNode;
  props: {
    children: FiberNode[];
  };
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

function render(element: FiberNode, container: Element | Text) {
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element],
    },
  };
}

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
  /** isn't root fiber node */
  if ('type' in fiber && !fiber.dom) {
    fiber.dom = createDomNode(fiber);
  }

  if ('parent' in fiber && fiber.parent?.dom && fiber.dom) {
    fiber.parent.dom.appendChild(fiber.dom);
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

  // TODO return next unit of work

  return null;
}

const Didact = {
  render,
  createElement,
};

export default Didact;
