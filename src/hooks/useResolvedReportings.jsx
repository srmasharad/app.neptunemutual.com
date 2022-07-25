import { useState, useEffect, useCallback } from "react";
import { useNetwork } from "@/src/context/Network";
import { CARDS_PER_PAGE } from "@/src/config/constants";
import { getSubgraphData } from "@/src/services/subgraph";

const getQuery = (itemsToSkip) => {
  return `
  {
    incidentReports(
      skip: ${itemsToSkip}
      first: ${CARDS_PER_PAGE}
      orderBy: incidentDate
      orderDirection: desc
      where:{
        resolved: true
      }
    ) {
      id
      coverKey
      productKey
      incidentDate
      resolutionDeadline
      resolved
      emergencyResolved
      emergencyResolveTransaction{
        timestamp
      }
      resolveTransaction{
        timestamp
      }
      finalized
      status
      resolutionTimestamp
      totalAttestedStake
      totalRefutedStake
    }
  }
  `;
};

export const useResolvedReportings = () => {
  const [data, setData] = useState({
    incidentReports: [],
  });
  const [loading, setLoading] = useState(false);
  const [itemsToSkip, setItemsToSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const { networkId } = useNetwork();

  useEffect(() => {
    let ignore = false;

    setLoading(true);
    getSubgraphData(networkId, getQuery(itemsToSkip))
      .then((_data) => {
        if (ignore || !_data) return;

        const isLastPage =
          _data.incidentReports.length === 0 ||
          _data.incidentReports.length < CARDS_PER_PAGE;

        if (isLastPage) {
          setHasMore(false);
        }

        setData((prev) => ({
          incidentReports: [...prev.incidentReports, ..._data.incidentReports],
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
      incidentReports: data.incidentReports,
    },
    loading,
  };
};
