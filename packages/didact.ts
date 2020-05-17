type DomNode = Text | HTMLElement | Element;

export interface IDidactElement {
  type: string;
  props: {
    [key: string]: any;
    children: IDidactElement[];
    nodeValue?: string;
  };
}

interface IFiberNodeProps {
  [key: string]: any;
  children: IDidactElement[];
  nodeValue?: string;
}

export interface IFiberNode {
  dom: DomNode;
  parent?: IFiberNode;
  child?: IFiberNode;
  sibling?: IFiberNode;
  type?: string;
  alternate?: IFiberNode;
  effectTag?: 'UPDATE' | 'PLACEMENT' | 'DELETION';
  props: IFiberNodeProps;
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

const isEvent = (key: string) => key.startsWith('on');
const isProperty = (key: string) => key !== 'children' && !isEvent(key);
const isNew = (prev: IFiberNodeProps, next: IFiberNodeProps) => (key: string) =>
  prev[key] !== next[key];
const isGone = (_, next: IFiberNodeProps) => (key: string) => !(key in next);

function updateDom(dom: DomNode, prevProps: IFiberNodeProps, nextProps: IFiberNodeProps) {
  //Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });

  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = '';
    });

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
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

function commitRoot() {
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

function commitWork(fiber: IFiberNode) {
  if (!fiber) {
    return;
  }

  const domParent = fiber.parent.dom;

  if (fiber.effectTag === 'PLACEMENT' && fiber.dom !== null) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === 'UPDATE') {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === 'DELETION') {
    domParent.removeChild(fiber.dom);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function render(element: IDidactElement, container: DomNode) {
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

let nextUnitOfWork: IFiberNode = null;
let wipRoot: IFiberNode = null;
let currentRoot: IFiberNode = null;
let deletions: IFiberNode[] = [];

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

function performUnitOfWork(fiber: IFiberNode) {
  // TODO add dom node
  // TODO create new fibers
  // TODO return next unit of work

  // TODO add dom node
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  // TODO create new fibers
  const elements = fiber.props.children;
  reconcileChildren(fiber, elements);

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

function reconcileChildren(wipFiber: IFiberNode, elements: IDidactElement[]) {
  let index = 0;
  let oldFiber = wipRoot.alternate && wipFiber.child.alternate;
  let prevSibling: IFiberNode = null;

  while (index < elements.length || oldFiber !== null) {
    const element = elements[index];

    let newFiber: IFiberNode = null;

    // TODO compare oldFiber to element
    const sameType = oldFiber && element && element.type === oldFiber.type;

    // Здесь же в самом React используются ключи (keys), которые улучшают процесс сравнения.
    // К примеру, это позволяет определить, когда потомки меняют свой порядок в массиве элементов.

    if (sameType) {
      // TODO update the node
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
      // TODO add this node
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: 'PLACEMENT',
      };
    }
    if (oldFiber && !sameType) {
      // TODO delete the oldFiber's node
      oldFiber.effectTag = 'DELETION';
      deletions.push(oldFiber);
    }

    if (index === 0) {
      wipFiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}

requestIdleCallback(workLoop);

const Didact = {
  render,
  createElement,
};

export default Didact;
