import copy from "clipboard-copy";
import { format } from "date-fns";
import styled from "styled-components";
import toFlexible from "toflexible";

import { CopyIcon } from "@mybucks/assets/icons";
import { Box as BaseBox } from "@mybucks/components/Containers";
import Link from "@mybucks/components/Link";
import { H3 } from "@mybucks/components/Texts";
import { truncate } from "@mybucks/lib/utils";
import media from "@mybucks/styles/media";

const Box = styled(BaseBox)`
  width: 100%;
`;

const TableWrapper = styled.table`
  width: 100%;
  font-size: ${({ theme }) => theme.sizes.base};
  td {
    padding-bottom: ${({ theme }) => theme.sizes.x3s};
  }

  ${media.sm`
    font-size: ${({ theme }) => theme.sizes.sm};

    a {
      font-size: ${({ theme }) => theme.sizes.sm};
    }
  `}
`;

const AmountTd = styled.td`
  color: ${({ theme, $in }) =>
    $in ? theme.colors.success : theme.colors.error};
`;

const DateTimeTd = styled.td`
  color: ${({ theme }) => theme.colors.gray400};
`;

const AddressTd = styled.td`
  display: flex;
  align-items: center;
`;

const AddressLinkLg = styled(Link)`
  text-decoration: none;
  ${media.md`
    display: none;
  `}
`;

const AddressLink = styled(Link)`
  text-decoration: none;
  display: none;
  ${media.md`
    display: inherit;
  `}
`;

const CopyButton = styled.img.attrs({
  alt: "Copy",
  src: CopyIcon,
})`
  cursor: pointer;
  margin-left: ${({ theme }) => theme.sizes.xs};
  width: ${({ theme }) => theme.sizes.sm};
`;

const ActivityTable = ({ account, history }) => (
  <Box>
    <H3>Activity</H3>

    <TableWrapper>
      <tbody>
        {history
          .map((item) => ({
            ...item,
            isReceipt: item.to.toLowerCase() === account.address.toLowerCase(),
            target:
              item.from.toLowerCase() === account.address.toLowerCase()
                ? item.to
                : item.from,
          }))
          .map((item) => (
            <tr key={item.hash}>
              <DateTimeTd>{format(item.blockTimestamp, "MM/dd")}</DateTimeTd>
              <AddressTd>
                <AddressLinkLg
                  href={account.linkOfAddress(item.target)}
                  target="_blank"
                >
                  {item.target}
                </AddressLinkLg>

                <AddressLink
                  href={account.linkOfAddress(item.target)}
                  target="_blank"
                >
                  {truncate(item.target, 8)}
                </AddressLink>

                <CopyButton onClick={() => copy(item.target)} />
              </AddressTd>
              <AmountTd $in={item.isReceipt}>
                {item.isReceipt ? "+" : "-"}&nbsp;
                {toFlexible(item.value, 2)}
              </AmountTd>
              <td>
                <Link
                  href={account.linkOfTransaction(item.hash)}
                  target="_blank"
                >
                  details
                </Link>
              </td>
            </tr>
          ))}
      </tbody>
    </TableWrapper>
  </Box>
);

export default ActivityTable;
