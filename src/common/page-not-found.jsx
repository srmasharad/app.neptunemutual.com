import Link from 'next/link'
import { useRouter } from 'next/router'

import { Container } from '@/common/Container/Container'
import { Routes } from '@/src/config/routes'
import { useNetwork } from '@/src/context/Network'
import { useValidateNetwork } from '@/src/hooks/useValidateNetwork'
import { classNames } from '@/utils/classnames'

export function PageNotFound () {
  const router = useRouter()
  const { networkId } = useNetwork()
  const { isMainNet, isArbitrum } = useValidateNetwork(networkId)

  const linkColor = isArbitrum
    ? 'border-1D9AEE bg-1D9AEE focus-visible:ring-1D9AEE'
    : isMainNet
      ? 'border-4e7dd9 bg-4e7dd9 focus-visible:ring-4e7dd9'
      : 'border-5D52DC bg-5D52DC focus-visible:ring-5D52DC'

  return (
    <div className='max-w-full bg-white'>
      <Container className='flex flex-col items-center bg-top bg-no-repeat bg-contain py-28 sm:bg-auto bg-404-background bg-origin-content'>
        <img src='/404.svg' alt='404 page not found' />
        <p className='py-3 my-12 font-bold leading-10 text-center text-xxxl'>
          404
        </p>
        <p className='mb-11 text-md'>
          Oops! Looks like you&#x2019;re heading to a wrong planet.
        </p>
        {(router.pathname !== Routes.Home) && (
          <Link href={Routes.Home} replace>
            <a
              className={classNames(
                'px-16 py-5 font-bold leading-8 uppercase border rounded-lg text-EEEEEE focus:outline-none focus-visible:ring-2',
                linkColor
              )}
            >
              Take me back to homepage
            </a>
          </Link>
        )}
      </Container>
    </div>
  )
}
