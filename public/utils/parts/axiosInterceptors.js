axios.interceptors.request.use(
    function (config) {
        $("#spinnerModal").modal({
            backdrop: false,
        });
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
