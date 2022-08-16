import { useState, useEffect, useCallback } from "react";
import { useNetwork } from "@/src/context/Network";
import { CARDS_PER_PAGE } from "@/src/config/constants";
import { fetchSubgraph } from "@/src/services/fetchSubgraph";

const getQuery = (itemsToSkip) => {
  return `
  {
    pools(
      skip: ${itemsToSkip}
      first: ${CARDS_PER_PAGE}
      where: {
        closed: false, 
        poolType: PODStaking
      }
    ) {
      id
      key
      name
      poolType
      stakingToken
      stakingTokenName
      stakingTokenSymbol
      stakingTokenDecimals
      uniStakingTokenDollarPair
      rewardToken
      rewardTokenName
      rewardTokenSymbol
      rewardTokenDecimals
      uniRewardTokenDollarPair
      rewardTokenDeposit
      maxStake
      rewardPerBlock
      lockupPeriodInBlocks
      platformFee
    }
  }
  `;
};

const fetchPodStakingPools = fetchSubgraph("usePodStakingPools");

export const usePodStakingPools = () => {
  const [data, setData] = useState({ pools: [] });
  const [loading, setLoading] = useState(false);
  const { networkId } = useNetwork();
  const [itemsToSkip, setItemsToSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    let ignore = false;

    if (!networkId) {
      setHasMore(false);
    }

    setLoading(true);

    fetchPodStakingPools(networkId, getQuery(itemsToSkip))
      .then((_data) => {
        if (ignore || !_data) return;

        const isLastPage =
          _data.pools.length === 0 || _data.pools.length < CARDS_PER_PAGE;

        if (isLastPage) {
          setHasMore(false);
        }

        setData((prev) => ({
          pools: [...prev.pools, ..._data.pools],
        }));
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        if (ignore) return;
        setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [itemsToSkip, networkId]);

  const handleShowMore = useCallback(() => {
    setItemsToSkip((prev) => prev + CARDS_PER_PAGE);
  }, []);

  return {
    handleShowMore,
    hasMore,
    data: {
      pools: data.pools,
    },
    loading,
  };
};
