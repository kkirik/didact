declare namespace Didact {
  interface Props {
    [key: string]: any;
    children: FiberNode[];
  }

  type NodeType = keyof HTMLElementTagNameMap | 'TEXT_ELEMENT';

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

  interface FiberUpdateNode {
    effectTag: 'UPDATE';
    type: NodeType;
    props: Props;
    parent: UnitOfWork;
    alternate: UnitOfWork;
    dom: DOMElement | undefined;
    child?: FiberNode;
    sibling?: FiberNode;
  }

  interface FiberPlacementNode {
    effectTag: 'PLACEMENT';
    type: NodeType;
    props: Props;
    parent: UnitOfWork;
    alternate: RootUnitOfWork | undefined;
    dom: DOMElement | undefined;
    child?: FiberNode;
    sibling?: FiberNode;
  }

  interface FiberDeletionNode {
    effectTag: 'DELETION';
    type: NodeType;
    props: Props;
    parent: UnitOfWork;
    alternate: RootUnitOfWork | undefined;
    dom: DOMElement;
    child?: FiberNode;
    sibling?: FiberNode;
  }

  type UnitOfWork = RootUnitOfWork | FiberNode;
}

export = Didact;
