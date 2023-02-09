import * as Tooltip from '@radix-ui/react-tooltip'
import { usePolicyTxs } from '@/src/hooks/usePolicyTxs'
import {
  Table,
  TableWrapper,
  TBody,
  THead
} from '@/common/Table/Table'
import AddCircleIcon from '@/icons/AddCircleIcon'
import ClockIcon from '@/icons/ClockIcon'
import OpenInNewIcon from '@/icons/OpenInNewIcon'
import { getTxLink } from '@/lib/connect-wallet/utils/explorer'
import { useWeb3React } from '@web3-react/core'
import { useRegisterToken } from '@/src/hooks/useRegisterToken'
import { convertFromUnits } from '@/utils/bn'
import { isValidProduct } from '@/src/helpers/cover'
import { fromNow } from '@/utils/formatter/relative-time'
import DateLib from '@/lib/date/DateLib'
import { formatCurrency } from '@/utils/formatter/currency'
import { useNetwork } from '@/src/context/Network'
import { t, Trans } from '@lingui/macro'
import { useRouter } from 'next/router'
import { usePagination } from '@/src/hooks/usePagination'
import { useCoverOrProductData } from '@/src/hooks/useCoverOrProductData'
import { useAppConstants } from '@/src/context/AppConstants'
import { TokenAmountSpan } from '@/common/TokenAmountSpan'
import { CoverAvatar } from '@/common/CoverAvatar'
import { Routes } from '@/src/config/routes'
import PolicyReceiptIcon from '@/icons/PolicyReceiptIcon'
import { NeutralButton } from '@/common/Button/NeutralButton'
import { LastSynced } from '@/common/LastSynced'
import { renderHeader } from '@/modules/my-liquidity/render'
import { useSortData } from '@/src/hooks/useSortData'

const renderWhen = (row) => <WhenRenderer row={row} />

const renderDetails = (row) => <DetailsRenderer row={row} />

const renderAmount = (row) => <CxTokenAmountRenderer row={row} />

const renderActions = (row) => <ActionsRenderer row={row} />

export const getColumns = (sorts = {}, handleSort = () => {}) => [
  {
    name: t`when`,
    align: 'left',
    renderHeader: (col) => renderHeader(col, 'transaction.timestamp', sorts, handleSort),
    renderData: renderWhen
  },
  {
    name: t`details`,
    align: 'left',
    renderHeader,
    renderData: renderDetails
  },
  {
    name: t`amount`,
    align: 'right',
    renderHeader,
    renderData: renderAmount
  },
  {
    name: '',
    align: 'right',
    renderHeader,
    renderData: renderActions
  }
]

export const MyPoliciesTxsTable = () => {
  const { page, limit, setPage } = usePagination()
  const { data, loading, hasMore } = usePolicyTxs({
    page,
    limit
  })

  const { networkId } = useNetwork()
  const { account } = useWeb3React()

  const { blockNumber, transactions } = data

  const { sorts, handleSort, sortedData } = useSortData({ data: transactions })

  const columns = getColumns(sorts, handleSort)

  return (
    <>
      <TableWrapper data-testid='policy-txs-table-wrapper'>
        <Table>
          <THead
            columns={columns}
            data-testid='policy-txs-table-header'
            title={<LastSynced blockNumber={blockNumber} networkId={networkId} />}
          />
          {account
            ? (
              <TBody
                isLoading={loading}
                columns={columns}
                data={sortedData}
              />
              )
            : (
              <tbody data-testid='connect-wallet-tbody'>
                <tr className='w-full text-center'>
                  <td className='p-6' colSpan={columns.length}>
                    <Trans>Please connect your wallet</Trans>
                  </td>
                </tr>
              </tbody>
              )}
        </Table>
      </TableWrapper>
      {(hasMore && account) && (
        <NeutralButton
          className='mt-4'
          disabled={loading}
          onClick={() => {
            setPage((prev) => prev + 1)
          }}
        >
          <Trans>Show More</Trans>
        </NeutralButton>

      )}
    </>
  )
}

const WhenRenderer = ({ row }) => {
  const router = useRouter()

  return (
    <td
      className='max-w-xs px-6 py-6 text-sm leading-5 whitespace-nowrap text-01052D'
      title={DateLib.toLongDateFormat(row.transaction.timestamp, router.locale)}
      data-testid='timestamp-col'
    >
      {fromNow(row.transaction.timestamp)}
    </td>
  )
}

const DetailsRenderer = ({ row }) => {
  const productKey = row.productKey
  const { liquidityTokenDecimals } = useAppConstants()
  const { coverInfo } = useCoverOrProductData({
    coverKey: row.cover.id,
    productKey
  })

  const isDiversified = isValidProduct(productKey)

  if (!coverInfo) {
    return null
  }

  const tokenAmountWithSymbol = (
    <TokenAmountSpan
      amountInUnits={row.daiAmount}
      decimals={liquidityTokenDecimals}
    />
  )

  const projectOrProductName = isDiversified
    ? coverInfo.infoObj.productName
    : coverInfo.infoObj.coverName || coverInfo.infoObj.projectName

  return (
    <td className='max-w-sm px-6 py-6' data-testid='details-col'>
      <div className='flex items-center whitespace-nowrap'>
        <CoverAvatar
          coverInfo={coverInfo}
          isDiversified={isDiversified}
          containerClass='grow-0'
          xs
        />
        <span className='pl-4 text-sm leading-5 text-left whitespace-nowrap text-01052D'>
          {row.type === 'CoverPurchased'
            ? (
              <Trans>
                Purchased {tokenAmountWithSymbol} {projectOrProductName} policy
              </Trans>
              )
            : (
              <Trans>
                Claimed {tokenAmountWithSymbol} {projectOrProductName} policy
              </Trans>
              )}
        </span>
      </div>
    </td>
  )
}

const CxTokenAmountRenderer = ({ row }) => {
  const { register } = useRegisterToken()
  const router = useRouter()
  const { liquidityTokenDecimals } = useAppConstants()

  const isClaimTx = row.type === 'Claimed'

  // @todo: cxTokenAmount will not be equal to daiAmount, if they don't have same decimals
  const amount = isClaimTx ? row.cxTokenAmount : row.daiAmount
  const decimals =
    isClaimTx ? row.cxToken.tokenDecimals : liquidityTokenDecimals
  const formattedCurrency = formatCurrency(
    convertFromUnits(amount, decimals),
    // convertFromUnits(row.cxTokenAmount, row.cxToken.tokenDecimals),
    router.locale,
    row.cxToken.tokenSymbol,
    true
  )

  return (
    <td className='max-w-sm px-6 py-6 text-right' data-testid='col-amount'>
      <div className='flex items-center justify-end text-sm leading-6 whitespace-nowrap'>
        <span
          className={isClaimTx ? 'text-FA5C2F' : 'text-01052D'}
          title={formattedCurrency.long}
        >
          {formattedCurrency.short}
        </span>
        <button
          className='p-1 ml-3'
          onClick={() =>
            register(
              row.cxToken.id,
              row.cxToken.tokenSymbol,
              row.cxToken.tokenDecimals
            )}
          title='Add to metamask'
        >
          <span className='sr-only'>Add to metamask</span>
          <AddCircleIcon className='w-4 h-4' />
        </button>
      </div>
    </td>
  )
}

const ActionsRenderer = ({ row }) => {
  const { networkId } = useNetwork()
  const router = useRouter()

  const isCoverPurchase = row.type === 'CoverPurchased'

  return (
    <td className='px-6 py-6 min-w-120' data-testid='col-actions'>
      <div className='flex items-center justify-end'>
        {/* Tooltip */}
        <Tooltip.Root>
          <Tooltip.Trigger className='p-1 mr-4 text-01052D'>
            <span className='sr-only'>
              <Trans>Timestamp</Trans>
            </span>
            <ClockIcon className='w-4 h-4 text-01052D' />
          </Tooltip.Trigger>

          <Tooltip.Content side='top'>
            <div className='max-w-sm p-3 text-sm leading-6 text-white bg-black rounded-xl'>
              <p>
                {DateLib.toLongDateFormat(
                  row.transaction.timestamp,
                  router.locale,
                  'UTC'
                )}
              </p>
            </div>
            <Tooltip.Arrow offset={16} className='fill-black' />
          </Tooltip.Content>
        </Tooltip.Root>

        {isCoverPurchase && (
          <a
            href={Routes.ViewPolicyReceipt(row.transaction.id)}
            target='_blank'
            rel='noreferrer noopener nofollow'
            className='p-1 mr-4 text-black'
            title='View Receipt'
          >
            <span className='sr-only'>View Receipt</span>
            <PolicyReceiptIcon className='w-4 h-4' />
          </a>
        )}

        <a
          href={getTxLink(networkId, { hash: row.transaction.id })}
          target='_blank'
          rel='noreferrer noopener nofollow'
          className='p-1 text-black'
          title='Open in explorer'
        >
          <span className='sr-only'>Open in explorer</span>
          <OpenInNewIcon className='w-4 h-4' />
        </a>
      </div>
    </td>
  )
}
