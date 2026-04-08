/**
 * @module components.parts.UserForm.index
 * @description Reusable presentational UI part component.
 */
import { Form, FormGroup, FormControl, ControlLabel } from "rsuite";

export default function UserForm({ formValue, onChange, fields }) {
  return (
    <Form
      fluid
      formValue={formValue}
      onChange={onChange}
    >
      {fields.map(({ name, label, type = "text" }) => (
        <FormGroup key={name}>
          <ControlLabel>{label}</ControlLabel>
          <FormControl
            name={name}
            type={type}
          />
        </FormGroup>
      ))}
    </Form>
  );
}
