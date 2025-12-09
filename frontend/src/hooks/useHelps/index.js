import api from "../../services/api";

const usePlans = () => {

    const findAll = async (params) => {
        const { data } = await api.request({
            url: `/helps`,
            method: 'GET',
            params
        });
        return data;
    }

    const list = async (params) => {
        try {
            const { data } = await api.get('/helps/list', { params });
            return data || [];
        } catch (error) {
            // Se der erro de rede, 404 ou não autenticado, retorna array vazio
            if (error.response?.status === 401) {
                // Não autenticado - não é um erro crítico aqui
                return [];
            }
            if (error.response?.status === 404) {
                // Rota não encontrada - não é um erro crítico
                return [];
            }
            if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
                // Erro de rede - backend pode não estar rodando
                console.warn("Erro de rede ao buscar helps. Backend pode não estar rodando.");
                return [];
            }
            console.warn("Erro ao buscar helps:", error);
            return [];
        }
    }

    const save = async (data) => {
        const { data: responseData } = await api.request({
            url: '/helps',
            method: 'POST',
            data
        });
        return responseData;
    }

    const update = async (data) => {
        const { data: responseData } = await api.request({
            url: `/helps/${data.id}`,
            method: 'PUT',
            data
        });
        return responseData;
    }

    const remove = async (id) => {
        const { data } = await api.request({
            url: `/helps/${id}`,
            method: 'DELETE'
        });
        return data;
    }

    return {
        findAll,
        list,
        save,
        update,
        remove
    }
}

export default usePlans;