/**
 * @module components.UserForm
 * @description Form component for creating and editing user profile fields.
 */
import { Form, FormGroup, FormControl, ControlLabel } from "rsuite";

/**
 * @function UserForm
 * @description A reusable form component for user-related forms. Utilizes rsuite's Form components and dynamically generates form fields based on the provided configuration.
 * @param {Object} param0 - The props object.
 * @param {Object} param0.formValue - The current form values.
 * @param {Function} param0.onChange - The function to call when form values change.
 * @param {Array} param0.fields - The array of field configurations.
 * @returns {JSX.Element} - The rendered form component.
 */
export default function UserForm({ formValue, onChange, fields }) {
  return (
    <Form fluid formValue={formValue} onChange={onChange}>
      {fields.map(({ name, label, type = "text" }) => (
        <FormGroup key={name}>
          <ControlLabel>{label}</ControlLabel>
          <FormControl name={name} type={type} />
        </FormGroup>
      ))}
    </Form>
  );
}
