/**
 * @module components.parts.ButtonPrimary.index
 * @description Reusable presentational UI part component.
 */
import { Button } from "rsuite";

export default function ButtonPrimary(props) {
  return (
    <Button
      appearance="primary"
      {...props}
    >
      {props.children}
    </Button>
  );
}
