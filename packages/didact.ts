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

// function createDom(fiber: UnitOfWork) {
//   const dom =
//     fiber.type === 'TEXT_ELEMENT'
//       ? document.createTextNode('')
//       : document.createElement(fiber.type);

//   Object.entries(fiber.props)
//     .filter(([key]) => key !== 'children')
//     .forEach(([key, value]) => {
//       dom[key] = value;
//     });

//   return dom;
// }

// function render(element: UnitOfWork, container: Element | Text) {
//   nextUnitOfWork = {
//     dom: container,
//     props: {
//       children: [element],
//     },
//   };
// }

// let nextUnitOfWork: UnitOfWork;

// function workLoop(deadline: IdleDeadline) {
//   let shouldYield = false;

//   while (nextUnitOfWork && !shouldYield) {
//     nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
//     shouldYield = deadline.timeRemaining() < 1;
//   }

//   requestIdleCallback(workLoop);
// }

// requestIdleCallback(workLoop);

// // 1. TODO add dom node
// // 2. TODO create new fibers
// // 3. TODO return next unit of work

// function performUnitOfWork(fiber: UnitOfWork) {
//   //1. TODO add dom node

//   if (!fiber.dom) {
//     console.log(fiber);

//     fiber.dom = createDom(fiber);
//   }

//   if (fiber.parent) {
//     fiber.parent.dom.appendChild(fiber.dom);
//   }

//   // 2. TODO create new fibers

//   const elements = fiber.props.children;
//   let index = 0;
//   let prevSibling: UnitOfWork;

//   while (index < elements.length) {
//     const element = elements[index];
//     const newFiber: UnitOfWork = {
//       type: element.type,
//       props: element.props,
//       parent: fiber,
//       dom: null,
//     };

//     if (index === 0) {
//       fiber.child = newFiber;
//     } else {
//       prevSibling.sibling = newFiber;
//     }

//     prevSibling = newFiber;
//     index++;
//   }

//   // 3. TODO return next unit of work

//   if (fiber.child) return fiber.child;

//   let nextFiber = fiber;

//   while (nextFiber) {
//     if (nextFiber.sibling) return nextFiber.sibling;

//     nextFiber = nextFiber.parent;
//   }
// }

const Didact = {
  render,
  createElement,
};

export default Didact;
