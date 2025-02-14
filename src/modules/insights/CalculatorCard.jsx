import { useMemo, useState } from 'react'

import { t, Trans } from '@lingui/macro'
import { CalculatorCardTitle } from '@/src/modules/insights/CalculatorCardTitle'

import { useAppConstants } from '@/src/context/AppConstants'
import { PolicyCalculation } from '@/src/modules/insights/PolicyCalculation'
import { DateRangePicker } from '@/src/modules/insights/DateRangePicker'
import { CoverOptions } from '@/src/modules/insights/CoverOptions'
import { CalculatorAmountHandler } from '@/src/modules/insights/CalculatorAmountHandler'
import { InputLabel } from '@/src/modules/insights/InputLabel'
import { isValidProduct } from '@/src/helpers/cover'
import { calculateCoverPolicyFee } from '@/utils/calculateCoverPolicyFee'
import { useWeb3React } from '@web3-react/core'
import ConnectWallet from '@/lib/connect-wallet/components/ConnectWallet/ConnectWallet'
import { useNotifier } from '@/src/hooks/useNotifier'
import { useNetwork } from '@/src/context/Network'
import { useValidateNetwork } from '@/src/hooks/useValidateNetwork'
import { getErrorMessage } from '@/src/helpers/tx'
import { convertFromUnits, isGreater, isGreaterOrEqual } from '@/utils/bn'
import { MIN_PROPOSAL_AMOUNT, MAX_PROPOSAL_AMOUNT } from '@/src/config/constants'
import { formatCurrency } from '@/utils/formatter/currency'
import { useRouter } from 'next/router'
import { useCoverDropdown } from '@/src/hooks/useCoverDropdown'

export const CalculatorCard = () => {
  const { account, library } = useWeb3React()

  const { notifier } = useNotifier()
  const { networkId } = useNetwork()
  const { isMainNet, isArbitrum } = useValidateNetwork(networkId)

  const {
    liquidityTokenDecimals,
    liquidityTokenSymbol
  } = useAppConstants()
  const [error, setError] = useState('')
  const [amount, setAmount] = useState('')
  const [result, setResult] = useState(null)
  const [resultLoading, setResultLoading] = useState(false)

  const router = useRouter()

  const {
    loading,
    covers,
    selected: selectedCover,
    setSelected: setSelectedCover
  } = useCoverDropdown()

  const availableLiquidity = useMemo(() => {
    return convertFromUnits(
      selectedCover?.stats?.availableLiquidity || '0',
      liquidityTokenDecimals
    ).toString()
  }, [selectedCover, liquidityTokenDecimals])

  function handleChange (val) {
    let error = ''

    if (isGreater(val, MAX_PROPOSAL_AMOUNT)) {
      error = t`Maximum proposal threshold is ${
        formatCurrency(MAX_PROPOSAL_AMOUNT, router.locale, liquidityTokenSymbol, true).long
      }`
    } else if (isGreater(availableLiquidity, 0) && isGreaterOrEqual(val, availableLiquidity)) {
      error = t`Maximum protection available is ${
        formatCurrency(availableLiquidity, router.locale, liquidityTokenSymbol, true).long
      }`
    } else if (isGreater(MIN_PROPOSAL_AMOUNT, val)) {
      error = t`Minimum proposal threshold is ${
        formatCurrency(MIN_PROPOSAL_AMOUNT, router.locale, liquidityTokenSymbol, true).long
      }`
    }

    setAmount(val)
    setError(error)
  }

  const [coverMonth, setCoverMonth] = useState('')

  const handleRadioChange = (e) => {
    setCoverMonth(e.target.value)
  }

  const calculatePolicyFee = async () => {
    setResultLoading(true)
    const { data, error } = await calculateCoverPolicyFee({
      value: amount,
      account,
      library,
      coverKey: selectedCover?.coverKey || '',
      productKey: isValidProduct(selectedCover?.productKey) && (selectedCover?.productKey || ''),
      coverMonth,
      liquidityTokenDecimals
    })
    if (error) setError(getErrorMessage(error))

    setResult(data)
    setResultLoading(false)
  }

  const buttonBg = isArbitrum
    ? 'bg-1D9AEE'
    : isMainNet
      ? 'bg-4e7dd9'
      : 'bg-5D52DC'

  const buttonClass = `block w-full pt-3 pb-3 uppercase px-4 py-0 text-sm font-semibold tracking-wider leading-loose text-white border border-transparent rounded-md whitespace-nowrap hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-75 disabled:hover:bg-opacity-100 ${buttonBg}`

  return (
    <>
      <div className='pb-4 lg:pb-6'>
        <CalculatorCardTitle text='Calculator ' />
      </div>
      <div className='pb-4 lg:pb-6'>
        <InputLabel label='Select a cover' />
        <CoverOptions
          loading={loading}
          covers={covers}
          selected={selectedCover}
          setSelected={setSelectedCover}
        />
      </div>

      <div className='pb-4 lg:pb-6'>
        <InputLabel label='Amount you wish to cover' />
        <CalculatorAmountHandler
          error={error}
          value={amount}
          buttonProps={{
            children: t`Max`,
            onClick: () => {},
            buttonClassName: 'hidden'
          }}
          unit={liquidityTokenSymbol}
          inputProps={{
            id: 'cover-amount',
            placeholder: t`Enter Amount`,
            value: amount,
            disabled: resultLoading,
            onChange: handleChange,
            allowNegativeValue: false
          }}
        />
      </div>
      <div className='pb-4 lg:pb-6'>
        <InputLabel label='Set expiry' />
        <DateRangePicker
          handleRadioChange={handleRadioChange}
          coverMonth={coverMonth}
          disabled={resultLoading}
        />
      </div>

      <div className='pb-6 lg:pb-10'>
        {
            account
              ? (
                <button
                  type='button'
                  disabled={!amount || !coverMonth || resultLoading || !selectedCover || Boolean(error)}
                  className={buttonClass}
                  title={t`Calculate policy fee`}
                  onClick={calculatePolicyFee}
                >
                  <span className='sr-only'>{t`Calculate policy fee`}</span>
                  <Trans>Calculate policy fee</Trans>
                </button>
                )
              : (
                <ConnectWallet networkId={networkId} notifier={notifier}>
                  {({ onOpen }) => {
                    return (
                      <button className={buttonClass} onClick={onOpen}>Connect Wallet</button>
                    )
                  }}
                </ConnectWallet>
                )
          }
      </div>
      <PolicyCalculation
        feeData={result}
        loading={resultLoading}
        selected={selectedCover}
        amount={amount}
      />
    </>
  )
}
