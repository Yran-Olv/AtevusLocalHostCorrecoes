import api, { openApi } from "../../services/api";

const useSettings = () => {
  const getAll = async (params) => {
    const { data } = await api.request({
      url: "/settings",
      method: "GET",
      params,
    });
    return data;
  };

  const update = async (data) => {
    const { data: responseData } = await api.request({
      url: `/settings/${data.key}`,
      method: "PUT",
      data,
    });
    console.log(responseData);
    return responseData;
  };

  const get = async (param) => {
    const { data } = await api.request({
      url: `/setting/${param}`,
      method: "GET",
    });
    return data;
  };

  const getPublicSetting = async (key) => {
    try {
      const params = {
        token: process.env.REACT_APP_ENV_TOKEN || "AASaaS"
      }

      const { data } = await openApi.request({
          url: `/public-settings/${key}`,
          method: 'GET',
          params
      });
      return data;
    } catch (error) {
      // Silenciar erros de rede/CORS em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Não foi possível carregar setting público: ${key}`, error.message);
        return null;
      }
      throw error;
    }
  };

  return {
    getAll,
    update,
    get,
    getPublicSetting,
  };
};

export default useSettings;
