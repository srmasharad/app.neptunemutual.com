import { RegularButton } from '@/common/Button/RegularButton'
import { CoverDropdown } from '@/common/CoverDropdown'
import { Routes } from '@/src/config/routes'
import { useNetwork } from '@/src/context/Network'
import { isValidProduct } from '@/src/helpers/cover'
import { useCoverDropdown } from '@/src/hooks/useCoverDropdown'
import { useValidateNetwork } from '@/src/hooks/useValidateNetwork'
import { classNames } from '@/utils/classnames'
import { t, Trans } from '@lingui/macro'
import { useRouter } from 'next/router'

export const PoliciesEmptyState = () => {
  const { networkId } = useNetwork()
  const { isArbitrum, isMainNet } = useValidateNetwork(networkId)
  const router = useRouter()

  const {
    loading,
    covers,
    selected,
    setSelected
  } = useCoverDropdown()

  const buttonAccent = isArbitrum
    ? 'bg-1D9AEE'
    : isMainNet
      ? 'bg-4e7dd9'
      : 'bg-5D52DC'

  const handleClick = () => {
    if (!selected) return

    router.push(
      Routes.PurchasePolicy(
        selected?.coverKey,
        isValidProduct(selected?.productKey) ? selected?.productKey : ''
      )
    )
  }

  return (
    <div>
      <div
        className='flex flex-col items-center w-full pt-20'
        data-testid='empty-text'
      >
        <img
          src='/images/covers/empty-list-illustration.svg'
          alt={t`No data found`}
          className='w-48 h-48'
        />
        <p className='max-w-full mt-8 text-center text-md text-404040 w-96'>
          <Trans>
            A cover policy enables you to claim and receive payout when an
            incident occurs. To purchase a policy, select a cover from the home
            screen.
          </Trans>
        </p>
      </div>

      <div className='w-full mx-auto mt-16 md:w-524px'>
        <CoverDropdown
          loading={loading}
          covers={covers}
          selected={selected}
          setSelected={setSelected}
        />

        <RegularButton
          className={classNames('mt-8 py-2.5 px-4 font-medium rounded-lg uppercase w-full', buttonAccent)}
          onClick={handleClick}
        >
          <Trans>Purchase Policy</Trans>
        </RegularButton>
      </div>
    </div>
  )
}
