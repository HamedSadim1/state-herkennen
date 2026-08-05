import React from "react";

interface FieldErrorProps {
  /** id referenced by the input's aria-describedby. */
  id: string;
  /** The validation message; renders nothing when absent (field is valid). */
  message?: string;
}

/**
 * Per-field validation message. Wired to its field via the shared error id
 * (referenced by the input's `aria-describedby`) so screen readers announce
 * the message when it appears. Renders nothing while the field is valid, so
 * the error only ever exists in the accessibility tree when there is one.
 */
const FieldError: React.FC<FieldErrorProps> = ({ id, message }) =>
  message ? (
    <p id={id} className="field-error" role="alert">
      {message}
    </p>
  ) : null;

export default FieldError;
