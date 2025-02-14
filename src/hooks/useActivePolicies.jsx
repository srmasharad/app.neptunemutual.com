import { sumOf } from '@/utils/bn'
import { useWeb3React } from '@web3-react/core'
import DateLib from '@/lib/date/DateLib'
import { useState, useEffect } from 'react'
import { useNetwork } from '@/src/context/Network'
import { useSubgraphFetch } from '@/src/hooks/useSubgraphFetch'

const getQuery = (startOfMonth, account) => {
  return `
  {
    userPolicies(
      where: {
        expiresOn_gt: "${startOfMonth}"
        account: "${account}"
      }
    ) {
      id
      coverKey
      productKey
      cxToken {
        id
        creationDate
        expiryDate
      }
      totalAmountToCover
      expiresOn
      cover {
        id
      }
      product {
        id
      }
    }
  }
  `
}

export const useActivePolicies = () => {
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(false)
  const fetchActivePolicies = useSubgraphFetch('useActivePolicies')

  const { networkId } = useNetwork()
  const { account } = useWeb3React()

  useEffect(() => {
    if (!account) {
      return
    }

    const startOfMonth = DateLib.toUnix(DateLib.getSomInUTC(Date.now()))

    setLoading(true)

    fetchActivePolicies(networkId, getQuery(startOfMonth, account))
      .then((_data) => {
        if (!_data) return
        setData(_data)
      })
      .catch((err) => {
        console.error(err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [account, fetchActivePolicies, networkId])

  const activePolicies = data.userPolicies || []
  const totalActiveProtection = sumOf(
    '0',
    ...activePolicies.map((x) => x.totalAmountToCover || '0')
  )

  return {
    data: {
      activePolicies,
      totalActiveProtection
    },
    loading
  }
}
