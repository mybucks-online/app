import styled from "styled-components";

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.sizes.xs};
  margin-bottom: ${({ theme }) => theme.sizes.xs};
`;
const CheckboxValue = styled.input.attrs({
  type: "checkbox",
  readOnly: true,
})``;
const CheckboxLabel = styled.label`
  font-size: ${({ theme }) => theme.sizes.xs};
  font-weight: ${({ theme }) => theme.weights.regular};
  line-height: 120%;
  color: ${({ theme }) => theme.colors.gray400};
  user-select: none;
`;

const Checkbox = ({ children, value, id }) => (
  <CheckboxWrapper>
    <CheckboxValue id={id} checked={!!value} />
    <CheckboxLabel htmlFor={id}>{children}</CheckboxLabel>
  </CheckboxWrapper>
);
export default Checkbox;
