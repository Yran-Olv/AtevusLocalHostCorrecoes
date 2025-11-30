import api, { openApi } from "../../services/api";

const usePlans = () => {

    const getPlanList = async (params) => {
        const { data } = await openApi.request({
            url: '/plans/list',
            method: 'GET',
            params
        });
        return data;
    }

    const list = async (params) => {
        const { data } = await api.request({
            url: '/plans/all',
            method: 'GET',
            params
        });
        return data;
    }

    const save = async (data) => {
        const { data: responseData } = await api.request({
            url: '/plans',
            method: 'POST',
            data
        });
        return responseData;
    }

    const update = async (data) => {
        const { data: responseData } = await api.request({
            url: `/plans/${data.id}`,
            method: 'PUT',
            data
        });
        return responseData;
    }

    const remove = async (id) => {
        const { data } = await api.request({
            url: `/plans/${id}`,
            method: 'DELETE'
        });
        return data;
    }

    const getPlanCompany = async (params, id) => {
        // Se não houver ID, retornar objeto vazio sem fazer requisição
        if (!id) {
            return {};
        }
        
        try {
            const { data } = await api.request({
                url: `/companies/listPlan/${id}`,
                method: 'GET',
                params
            });
            return data;
        } catch (error) {
            // Se erro de rede, retornar objeto vazio
            if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
                console.warn("Erro de rede ao buscar plano da empresa. Verifique se o backend está rodando.");
                return {};
            }
            // Para outros erros, ainda lançar para que o componente possa tratar
            throw error;
        }
    }

    return {
        getPlanList,
        list,
        save,
        update,
        remove,
        getPlanCompany
    }
}

export default usePlans;