/**
 * @module components.AuthForm
 * @description Reusable UI component module.
 */
import { Form, FormGroup, FormControl, ControlLabel, Button, Message } from "rsuite";

export default function AuthForm({
  formValue,
  setFormValue,
  onSubmit,
  buttonLabel,
  error,
}) {
  return (
    <>
      {error && (
        <Message type="error" description={error} style={{ marginBottom: 16 }} />
      )}

      <Form fluid formValue={formValue} onChange={setFormValue}>
        <FormGroup>
          <ControlLabel>Email</ControlLabel>
          <FormControl name="email" />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Password</ControlLabel>
          <FormControl name="password" type="password" />
        </FormGroup>

        <Button appearance="primary" block onClick={onSubmit}>
          {buttonLabel}
        </Button>
      </Form>
    </>
  );
}
