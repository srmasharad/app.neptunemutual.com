import { useState, useEffect } from "react";
import { useNetwork } from "@/src/context/Network";
import { fetchSubgraph } from "@/src/services/fetchSubgraph";

const isValidTimestamp = (_unix) => !!_unix && _unix != "0";

const getQuery = (start, end, coverKey, productKey) => {
  return `
  {
    incidentReports(
      where: {
        incidentDate_gt: "${start}",
        incidentDate_lt: "${end}",
        coverKey: "${coverKey}"
        productKey: "${productKey}"
      },
      orderBy: incidentDate,
      orderDirection: desc
    ) {
      incidentDate
      resolutionDeadline
      status
      claimBeginsFrom
      claimExpiresAt
    }
  }
  `;
};

const fetchValidReport = fetchSubgraph("useValidReport");

export const useValidReport = ({ start, end, coverKey, productKey }) => {
  const [data, setData] = useState({
    incidentReports: [],
  });
  const [loading, setLoading] = useState(false);
  const { networkId } = useNetwork();

  useEffect(() => {
    if (!isValidTimestamp(start) || !isValidTimestamp(end)) {
      return;
    }

    setLoading(true);

    fetchValidReport(networkId, getQuery(start, end, coverKey, productKey))
      .then((_data) => {
        if (!_data) return;
        setData(_data);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [coverKey, end, networkId, productKey, start]);

  return {
    data: {
      report: data?.incidentReports[0],
    },
    loading,
  };
};
