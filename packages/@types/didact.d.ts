declare namespace Didact {
  interface Props {
    [key: string]: any;
    children: FiberNode[];
  }

  type FunctionalComponent<T extends Props = any> = (props: T) => FiberNode;

  type NodeType =
    | FunctionalComponent
    | keyof HTMLElementTagNameMap
    | 'TEXT_ELEMENT';

  type DOMElement = Element | Text;

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
    dom: DOMElement | undefined;
    child?: FiberNode;
  }

  type FiberNode = FiberUpdateNode | FiberPlacementNode | FiberDeletionNode;

  interface CommonFiberNode {
    type: NodeType;
    props: Props;
    parent: UnitOfWork;
    child?: FiberNode;
    sibling?: FiberNode;
  }

  interface FiberUpdateNode extends CommonFiberNode {
    effectTag: 'UPDATE';
    alternate: UnitOfWork;
    dom: DOMElement | undefined;
  }

  interface FiberPlacementNode extends CommonFiberNode {
    effectTag: 'PLACEMENT';
    alternate: UnitOfWork | undefined;
    dom: DOMElement | undefined;
  }

  interface FiberDeletionNode extends CommonFiberNode {
    effectTag: 'DELETION';
    alternate: UnitOfWork | undefined;
    dom: DOMElement;
  }

  type UnitOfWork = RootUnitOfWork | FiberNode;
}

export = Didact;
