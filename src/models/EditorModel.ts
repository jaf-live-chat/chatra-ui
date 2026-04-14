export type EditorProps = {
  id?: string;
  label?: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  placeholder?: string;
  editable?: boolean;
  showToolbar?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  minHeight?: number;
  value?: string;
  onChange?: (nextValue: string) => void;
};
