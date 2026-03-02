import styled from "styled-components";

const Track = styled.div`
  display: flex;
  width: 100%;
  height: 4px;
  gap: 2px;
  border-radius: 2px;
  background: ${({ theme }) => theme.colors.gray100};
  padding: 0 1px;
  margin-bottom: ${({ theme }) => theme.sizes.xs};
  box-sizing: border-box;
`;

const Segment = styled.div`
  flex: 1;
  height: 100%;
  min-width: 0;
  border-radius: 1px;
  background: ${({ $filled, theme }) =>
    $filled ? theme.colors.gray400 : "transparent"};
  transition: background 0.15s ease;
`;

/**
 * Horizontal strength meter bar. Full width, narrow height.
 * @param {number} level - Current strength 0..maxLevel
 * @param {number} maxLevel - Number of segments (e.g. 4 for passphrase, 2 for PIN)
 */
const StrengthMeter = ({ level = 0, maxLevel = 4 }) => {
  const segments = Math.max(1, Math.round(maxLevel));
  const filledCount = Math.min(Math.max(0, Math.round(level)), segments);

  return (
    <Track role="meter" aria-valuenow={filledCount} aria-valuemin={0} aria-valuemax={segments}>
      {Array.from({ length: segments }, (_, i) => (
        <Segment key={i} $filled={i < filledCount} />
      ))}
    </Track>
  );
};

export default StrengthMeter;
