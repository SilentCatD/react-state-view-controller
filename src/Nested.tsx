import React from 'react'
import {
  CElement,
  DOMElement,
  DetailedReactHTMLElement,
  FunctionComponentElement,
  PropsWithChildren,
  ReactElement,
  ReactHTMLElement,
  ReactNode,
  ReactSVGElement,
} from 'react'

type ReceivableElement =
  | DetailedReactHTMLElement<any, any>
  | ReactHTMLElement<any>
  | ReactSVGElement
  | DOMElement<any, any>
  | FunctionComponentElement<any>
  | CElement<any, any>
  | ReactElement<any>
type NestedProps = {
  elements: ReceivableElement[]
}
const Nested: React.FC<PropsWithChildren<NestedProps>> = ({ elements, children }) => {
  const renderNested = (nestedElements: ReceivableElement[], nestedChildren?: ReactNode): ReactElement | ReactNode => {
    const [currentElement, ...remainingElement] = nestedElements
    if (currentElement) {
      return React.cloneElement(currentElement, undefined, renderNested(remainingElement, nestedChildren))
    }
    return children
  }
  return renderNested(elements, children)
}
export type { ReceivableElement, NestedProps }
export default Nested
