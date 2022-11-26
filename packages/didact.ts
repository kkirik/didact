/**
 * @link {https://site-chi-orcin.now.sh/build-your-own-react/}
 */

interface Props {
  children: FiberNode[];
}

type DOMNode = Element | Text | undefined;

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
  alternate: RootUnitOfWork | undefined;
  dom: DOMNode;
  child?: FiberNode;
}

interface FiberNode {
  type: keyof HTMLElementTagNameMap | 'TEXT_ELEMENT';
  props: Props;
  parent: UnitOfWork;
  alternate: RootUnitOfWork | undefined;
  dom: DOMNode;
  effectTag: 'UPDATE' | 'PLACEMENT' | 'DELETION';
  child?: FiberNode;
  sibling?: FiberNode;
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

  const isNodeProperty = (key) => key !== 'children';

  Object.keys(fiber.props)
    .filter(isNodeProperty)
    .forEach((name) => {
      dom[name] = fiber.props[name];
    });

  return dom;
}

let nextUnitOfWork: UnitOfWork | undefined = undefined;
let wipRoot: RootUnitOfWork | undefined = undefined;
let currentRoot: RootUnitOfWork | undefined = undefined;
let deletions: any[] | undefined = undefined;

function render(element: FiberNode, container: Element | Text) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };
  deletions = [];
  nextUnitOfWork = wipRoot;
}

function updateDom(
  dom: DOMNode,
  prevProps: Props | undefined,
  nextProps: Props | undefined
) {
  // TODO
}

function commitWork(fiber: FiberNode | undefined) {
  if (!fiber) {
    return;
  }

  const domParent = fiber.parent?.dom;

  if (fiber.effectTag === 'PLACEMENT' && domParent && fiber.dom) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === 'UPDATE' && domParent && fiber.dom) {
    updateDom(fiber.dom, fiber.alternate?.props, fiber.props);
  } else if (fiber.effectTag === 'DELETION' && domParent && fiber.dom) {
    domParent?.removeChild(fiber.dom);
  }

  if (domParent && fiber.dom) {
    domParent.appendChild(fiber.dom);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function commitRoot() {
  deletions?.forEach(commitWork);

  if (wipRoot?.child) {
    commitWork(wipRoot.child);
    currentRoot = wipRoot;
    wipRoot = undefined;
  }
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

function performUnitOfWork(fiber: UnitOfWork): UnitOfWork | undefined {
  /** isn't root fiber node */
  if ('type' in fiber && !fiber.dom) {
    fiber.dom = createDomNode(fiber);
  }

  const elements = fiber.props.children;

  reconcileChildren(fiber, elements);

  if (fiber.child) {
    return fiber.child;
  }

  let nextFiber: UnitOfWork | undefined = fiber;

  while (nextFiber) {
    if ('sibling' in nextFiber && nextFiber.sibling) {
      return nextFiber.sibling;
    }

    if ('parent' in nextFiber) {
      nextFiber = nextFiber?.parent;
    } else {
      nextFiber = undefined;
    }
  }

  return undefined;
}

function reconcileChildren(wipFiber: UnitOfWork, elements: FiberNode[]) {
  let index = 0;
  let oldFiber = wipFiber.alternate?.child;
  let prevSibling: FiberNode | undefined = undefined;

  while (index < elements.length || oldFiber) {
    const element = elements[index];
    let newFiber: FiberNode | undefined = undefined;

    const sameType = oldFiber && element && element.type == oldFiber.type;

    if (sameType && oldFiber) {
      // update the node
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber as any,
        effectTag: 'UPDATE',
      };
    }

    if (element && !sameType) {
      // add this node
      newFiber = {
        type: element.type,
        props: element.props,
        dom: undefined,
        parent: wipFiber,
        alternate: undefined,
        effectTag: 'PLACEMENT',
      };
    }

    if (oldFiber && !sameType && deletions) {
      // delete the oldFiber's node
      oldFiber.effectTag = 'DELETION';
      deletions.push(oldFiber);
    }

    if (index === 0) {
      wipFiber.child = newFiber;
    } else if (prevSibling) {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}

const Didact = {
  render,
  createElement,
};

export default Didact;
