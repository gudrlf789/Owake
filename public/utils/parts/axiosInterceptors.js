axios.interceptors.request.use(
    function (config) {
        $("#spinnerModal").modal();
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

axios.interceptors.response.use(
    function (response) {
        $("#spinnerModal").modal("hide");
        return response;
    },
    function (error) {
        return Promise.reject(error);
    }
);
