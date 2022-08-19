import { useNetwork } from "@/src/context/Network";
import { fetchSubgraph } from "@/src/services/fetchSubgraph";
import { useEffect, useState } from "react";

const getQuery = () => {
  return `
  {
    coverProducts {
      id
      coverKey
      productKey
    }
  }
`;
};

const fetchFlattenedCoverProducts = fetchSubgraph("useFlattenedCoverProducts");

export const useFlattenedCoverProducts = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { networkId } = useNetwork();

  useEffect(() => {
    setLoading(true);
    fetchFlattenedCoverProducts(networkId, getQuery())
      .then((data) => {
        if (!data) return;
        setData(data.coverProducts);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [networkId]);

  return {
    loading,
    data,
  };
};
