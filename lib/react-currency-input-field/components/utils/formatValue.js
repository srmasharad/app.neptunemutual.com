/* eslint-disable prefer-regex-literals */
import { escapeRegExp } from './escapeRegExp'
import { getSuffix } from './getSuffix'

/**
 * Format value with decimal separator, group separator and prefix
 */
export const formatValue = (options) => {
  const {
    value: _value,
    decimalSeparator,
    intlConfig,
    decimalScale,
    prefix = '',
    suffix = ''
  } = options

  if (_value === '' || _value === undefined) {
    return ''
  }

  if (_value === '-') {
    return '-'
  }

  const isNegative = new RegExp(
    `^\\d?-${prefix ? `${escapeRegExp(prefix)}?` : ''}\\d`
  ).test(_value)
  const value =
    decimalSeparator !== '.'
      ? replaceDecimalSeparator(_value, decimalSeparator, isNegative)
      : _value

  const numberFormatter = intlConfig
    ? new Intl.NumberFormat(
      intlConfig.locale,
      intlConfig.currency
        ? {
            style: 'currency',
            currency: intlConfig.currency,
            minimumFractionDigits: decimalScale || 0,
            maximumFractionDigits: 20
          }
        : undefined
    )
    : new Intl.NumberFormat(undefined, {
      minimumFractionDigits: decimalScale || 0,
      maximumFractionDigits: 20
    })

  const parts = numberFormatter.formatToParts(Number(value))

  let formatted = replaceParts(parts, options)

  // Does intl formatting add a suffix?
  const intlSuffix = getSuffix(formatted, { ...options })

  // Include decimal separator if user input ends with decimal separator
  const includeDecimalSeparator =
    _value.slice(-1) === decimalSeparator ? decimalSeparator : ''

  const [, decimals] = value.match(RegExp('\\d+\\.(\\d+)')) || []

  // Keep original decimal padding if no decimalScale
  if (decimalScale === undefined && decimals && decimalSeparator) {
    if (formatted.includes(decimalSeparator)) {
      formatted = formatted.replace(
        RegExp(`(\\d+)(${escapeRegExp(decimalSeparator)})(\\d+)`, 'g'),
        `$1$2${decimals}`
      )
    } else {
      if (intlSuffix && !suffix) {
        formatted = formatted.replace(
          intlSuffix,
          `${decimalSeparator}${decimals}${intlSuffix}`
        )
      } else {
        formatted = `${formatted}${decimalSeparator}${decimals}`
      }
    }
  }

  if (suffix && includeDecimalSeparator) {
    return `${formatted}${includeDecimalSeparator}${suffix}`
  }

  if (intlSuffix && includeDecimalSeparator) {
    return formatted.replace(
      intlSuffix,
      `${includeDecimalSeparator}${intlSuffix}`
    )
  }

  if (intlSuffix && suffix) {
    return formatted.replace(intlSuffix, `${includeDecimalSeparator}${suffix}`)
  }

  return [formatted, includeDecimalSeparator, suffix].join('')
}

/**
 * Before converting to Number, decimal separator has to be .
 */
const replaceDecimalSeparator = (value, decimalSeparator, isNegative) => {
  let newValue = value
  if (decimalSeparator && decimalSeparator !== '.') {
    newValue = newValue.replace(
      RegExp(escapeRegExp(decimalSeparator), 'g'),
      '.'
    )
    if (isNegative && decimalSeparator === '-') {
      newValue = `-${newValue.slice(1)}`
    }
  }
  return newValue
}

const replaceParts = (
  parts,
  {
    prefix,
    groupSeparator,
    decimalSeparator,
    decimalScale,
    disableGroupSeparators = false
  }
) => {
  return parts
    .reduce(
      (prev, { type, value }, i) => {
        if (i === 0 && prefix) {
          if (type === 'minusSign') {
            return [value, prefix]
          }

          if (type === 'currency') {
            return [...prev, prefix]
          }

          return [prefix, value]
        }

        if (type === 'currency') {
          return prefix ? prev : [...prev, value]
        }

        if (type === 'group') {
          return !disableGroupSeparators
            ? [...prev, groupSeparator !== undefined ? groupSeparator : value]
            : prev
        }

        if (type === 'decimal') {
          if (decimalScale !== undefined && decimalScale === 0) {
            return prev
          }

          return [
            ...prev,
            decimalSeparator !== undefined ? decimalSeparator : value
          ]
        }

        if (type === 'fraction') {
          return [
            ...prev,
            decimalScale !== undefined ? value.slice(0, decimalScale) : value
          ]
        }

        return [...prev, value]
      },
      ['']
    )
    .join('')
}
