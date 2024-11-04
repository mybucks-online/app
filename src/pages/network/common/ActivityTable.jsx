import copy from "clipboard-copy";
import { format } from "date-fns";
import { ethers } from "ethers";
import styled from "styled-components";
import toFlexible from "toflexible";

import CopyIconImg from "@mybucks/assets/icons/copy.svg";
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
  src: CopyIconImg,
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
        {history.map((item) => (
          <tr key={item.txnHash}>
            <td>{format(item.time, "MM/dd")}</td>
            <AddressTd>
              <AddressLinkLg
                href={account.linkOfAddress(
                  item.transferType === "IN" ? item.fromAddress : item.toAddress
                )}
                target="_blank"
              >
                {item.transferType === "IN" ? item.fromAddress : item.toAddress}
              </AddressLinkLg>

              <AddressLink
                href={account.linkOfAddress(
                  item.transferType === "IN" ? item.fromAddress : item.toAddress
                )}
                target="_blank"
              >
                {truncate(
                  item.transferType === "IN"
                    ? item.fromAddress
                    : item.toAddress,
                  8
                )}
              </AddressLink>

              <CopyButton
                onClick={() =>
                  copy(
                    item.transferType === "IN"
                      ? item.fromAddress
                      : item.toAddress
                  )
                }
              />
            </AddressTd>
            <AmountTd $in={item.transferType === "IN"}>
              {item.transferType === "IN" ? "+" : "-"}&nbsp;
              {toFlexible(
                parseFloat(ethers.formatUnits(item.amount, item.decimals)),
                2
              )}
            </AmountTd>
            <td>
              <Link
                href={account.linkOfTransaction(item.txnHash)}
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
