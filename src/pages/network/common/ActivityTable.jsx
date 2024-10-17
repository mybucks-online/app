import React from "react";
import { ethers } from "ethers";
import styled from "styled-components";
import { format } from "date-fns";
import toFlexible from "toflexible";

import { truncate } from "@mybucks/lib/utils";
import { Box as BaseBox } from "@mybucks/components/Containers";
import Link from "@mybucks/components/Link";
import { H3 } from "@mybucks/components/Texts";
import media from "@mybucks/styles/media";

const Box = styled(BaseBox)`
  width: 100%;
`;

const TableWrapper = styled.table`
  width: 100%;

  td {
    padding-bottom: 4px;
  }
`;

const AmountTd = styled.td`
  color: ${({ theme, $in }) =>
    $in ? theme.colors.success : theme.colors.error};
`;

const AddressTd = styled.td`
  ${media.sm`
    display: none;
  `}
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
                  item.transferType === "IN" ? item.fromAddress : item.toAddress
                )}
              </AddressLink>
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
