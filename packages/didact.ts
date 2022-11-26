/**
 * @link {https://site-chi-orcin.now.sh/build-your-own-react/}
 */

import type {
  DidactElement,
  Props,
  FiberNode,
  UnitOfWork,
  RootUnitOfWork,
  DOMElement,
  FiberDeletionNode,
} from './@types/didact';

export type {
  DidactElement,
  Props,
  FiberNode,
  UnitOfWork,
  RootUnitOfWork,
  DOMElement,
};

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

const isNodeProperty = (key: string) => key !== 'children' && !isEvent(key);
const isNew = (prev: Props, next: Props) => (key: keyof Props) =>
  prev[key] !== next[key];
const isGone = (props: Props) => (key: keyof Props) => !props[key];
const isEvent = (key: string) => key.startsWith('on');

function createDom(fiber: FiberNode) {
  const dom =
    fiber.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(fiber.type as keyof HTMLElementTagNameMap);

  updateDom(dom, {children: []}, fiber.props);

  return dom;
}

let nextUnitOfWork: UnitOfWork | undefined = undefined;
let wipRoot: RootUnitOfWork | undefined = undefined;
let currentRoot: RootUnitOfWork | undefined = undefined;
let deletions: FiberNode[] | undefined = undefined;

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

function updateDom(dom: DOMElement, prevProps: Props, nextProps: Props) {
  //Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(
      (name) => isGone(nextProps)(name) || isNew(prevProps, nextProps)(name)
    )
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);

      dom.removeEventListener(eventType, prevProps[name]);
    });

  // Remove old properties
  Object.keys(prevProps)
    .filter(isNodeProperty)
    .filter(isGone(nextProps))
    .forEach((name) => {
      dom[name] = '';
    });

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isNodeProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = nextProps[name];
    });

  // Add event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);

      dom.addEventListener(eventType, nextProps[name]);
    });
}

function commitDeletion(fiber: FiberDeletionNode, domParent: DOMElement) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else {
    // For Functional components
    commitDeletion(fiber.child as FiberDeletionNode, domParent);
  }
}

function commitWork(fiber: FiberNode | undefined) {
  if (!fiber) {
    return;
  }

  let domParentFiber = fiber.parent as FiberNode;

  // For Functional components
  // Functional components don't contain dom node
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent as FiberNode;
  }

  const domParent = domParentFiber.dom;

  if (fiber.effectTag === 'PLACEMENT' && domParent && fiber.dom) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === 'UPDATE' && fiber.dom) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === 'DELETION' && domParent && fiber.dom) {
    commitDeletion(fiber, domParent);
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

function reconcileChildren(wipFiber: UnitOfWork, elements: FiberNode[]) {
  let index = 0;
  let oldFiber = wipFiber.alternate?.child;
  let prevSibling: FiberNode | undefined = undefined;

  while (index < elements.length || oldFiber) {
    // might be undefined when oldFiber exists and elements are empty array
    const element = elements[index] as FiberNode | undefined;
    let newFiber: FiberNode | undefined = undefined;

    const sameType = oldFiber && element && element.type == oldFiber.type;

    if (sameType && oldFiber) {
      // update the node
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
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

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
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

function updateFunctionComponent(fiber: FiberNode) {
  if (!(fiber.type instanceof Function)) {
    return;
  }

  const children = [fiber.type(fiber.props)];

  reconcileChildren(fiber, children);
}

function updateHostComponent(fiber: UnitOfWork) {
  /** isn't root fiber node */
  if ('type' in fiber && !fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  reconcileChildren(fiber, fiber.props.children);
}

function performUnitOfWork(fiber: UnitOfWork): UnitOfWork | undefined {
  const isFunctionComponent = 'type' in fiber && fiber.type instanceof Function;

  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  if (fiber.child) {
    return fiber.child;
  }

  let nextFiber: UnitOfWork | undefined = fiber;

  while (nextFiber) {
    if ('sibling' in nextFiber && nextFiber.sibling) {
      return nextFiber.sibling;
    }

    if ('parent' in nextFiber) {
      nextFiber = nextFiber.parent;
    } else {
      nextFiber = undefined;
    }
  }

  return undefined;
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

const Didact = {
  render,
  createElement,
};

export default Didact;
