import { ModalCloseButton } from '@/common/Modal/ModalCloseButton'
import { ModalRegular } from '@/common/Modal/ModalRegular'
import { ModalWrapper } from '@/common/Modal/ModalWrapper'
import { StakeForm } from '@/src/modules/pools/staking/StakeForm'
import * as Dialog from '@radix-ui/react-dialog'
import { useState } from 'react'

export const StakeModal = ({
  info,
  refetchInfo,
  poolKey,
  modalTitle,
  isOpen,
  onClose,
  stakingTokenSymbol,
  lockupPeriod,
  analyticsFunnelName
}) => {
  const [isDisabled, setIsDisabled] = useState(false)
  return (
    <ModalRegular
      isOpen={isOpen}
      onClose={onClose}
      disabled={isDisabled}
      data-testid='staking-modal'
    >
      <ModalWrapper className='max-w-md bg-f6f7f9 xs:overflow-y-auto'>
        <Dialog.Title className='flex items-center font-bold text-display-sm'>
          {modalTitle}
        </Dialog.Title>

        <ModalCloseButton
          disabled={isDisabled}
          onClick={onClose}
        />

        <StakeForm
          info={info}
          refetchInfo={refetchInfo}
          poolKey={poolKey}
          onClose={onClose}
          stakingTokenSymbol={stakingTokenSymbol}
          lockupPeriod={lockupPeriod}
          setModalDisabled={setIsDisabled}
          analyticsFunnelName={analyticsFunnelName}
        />
      </ModalWrapper>
    </ModalRegular>
  )
}
