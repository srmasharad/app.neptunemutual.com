import { useMemo } from 'react'
import { classNames } from '@/utils/classnames'
import { Trans } from '@lingui/macro'

export const CoverAvatar = ({
  imgs = [],
  containerClass = 'grow',
  size = 'default'
}) => {
  const sizeClasses = useMemo(() => {
    const classes = {
      diversifiedWrapper: 'w-14 h-14 lg:w-18 lg:h-18',
      diversifiedImg: 'p-4',
      dedicatedWrapper: 'w-14 h-14 lg:w-18 lg:h-18 p-4',
      dedicatedImg: ''
    }

    if (size === 'small') {
      classes.diversifiedWrapper = 'w-11 h-11 lg:-ml-5'
      classes.diversifiedImg = 'p-2'
      classes.dedicatedWrapper = 'w-10 h-10 p-2'
    }

    if (size === 'xs') {
      classes.diversifiedWrapper = 'w-6 h-6'
      classes.diversifiedImg = 'p-1'
      classes.dedicatedWrapper = 'w-6 h-6'
      classes.dedicatedImg = 'w-4.5 h-4.5'
    }

    return classes
  }, [size])

  if (!imgs || imgs.length < 1) {
    return null
  }

  return (
    <div className={classNames('flex items-center', containerClass)}>
      {imgs.length > 1
        ? (
          <>
            {imgs.slice(0, 3).map((item, idx) => {
              return (
                <div
                  className={classNames(
                    'inline-block max-w-full bg-FEFEFF rounded-full',
                    idx !== 0 && '-ml-7 lg:-ml-9 p-0.5',
                    sizeClasses.diversifiedWrapper
                  )}
                  key={item.src}
                >
                  <img
                    src={item.src}
                    alt={item.alt}
                    className={classNames(
                      'w-full h-full rounded-full bg-DEEAF6',
                      sizeClasses.diversifiedImg
                    )}
                    data-testid='cover-img'
                    onError={(ev) => (ev.target.src = '/images/covers/empty.svg')}
                  />
                </div>
              )
            })}

            {imgs.length > 3 && (
              <p className='ml-2 text-xs opacity-40 text-01052D'>
                +{imgs.length - 3} <Trans>MORE</Trans>
              </p>
            )}
          </>
          )
        : (
          <div
            className={classNames(
              'inline-flex justify-center items-center max-w-full bg-DEEAF6 rounded-full',
              sizeClasses.dedicatedWrapper
            )}
          >
            <img
              src={imgs[0].src}
              alt={imgs[0].alt}
              className={classNames('inline-block', sizeClasses.dedicatedImg)}
              data-testid='cover-img'
              onError={(ev) => (ev.target.src = '/images/covers/empty.svg')}
            />
          </div>
          )}
    </div>
  )
}
