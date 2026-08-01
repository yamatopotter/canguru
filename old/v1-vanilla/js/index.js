(()=>{

    const BASE_URI = 'https://api.vuupt.com/api/v1/';
    const TOKEN = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5MzcxZDcyYi0xZTVjLTQ2OGYtOTRmNi02YjM0Yzk2NDg3N2MiLCJqdGkiOiI0YzY0NzY5Yjc3ZTg2MDViNjA1YTQwOTIzYTdhNDkyMDIyMzE4Y2E2Y2MyOWI5ZWNmNjBlYzFmZmJmNTlkZGM3OWQ5NGJlOGMxMTNjMmFkYyIsImlhdCI6MTcwMDYwMTI1OS40MjkxNjMsIm5iZiI6MTcwMDYwMTI1OS40MjkxNjYsImV4cCI6NDg1NjI3NDg1OS40MTg2MDIsInN1YiI6IjI4MzQ0Iiwic2NvcGVzIjpbXX0.u75NIBdX9vw2O7HRA_c1CJKub61cg51Wm0thRJILyIoof-2MnF7nvN6HBMjH_14KJbsn4rb1l2cg1Rlqzrm99nRhI5WnG0CwmBww5K4XWM236pTq-gcqQz9IWC2PVcoLzzV9h8OJ8pTPaA3Dp3hnc99oMmkocL61BsI4Ba45OkH-C9VLu03gY98J8bGm7jwPV2Sqm0alKGM0aOEEb_2yAv4mVAAKEw4K9zEUZxqabZwmB7sdwdrfC1BpIr10-4QqQOJu8jvhcP9heOqP6Te9UacDGZ3gaUsj-yrVIXcXF_BCm5Mqewy3KMHc7_TeF16fBhFi6zs15-Q6HdgExC68wNKDPttQ5dsxmBzvPQwNU21zJWHP-Ut4JrmCeFnP_IzOYzz9sdGHd7mlXf4bNrNzOPygqSy2N61VcW2d8RyyL_kRYYDqDmoEyfJJgBh8X5633pc9zctuQQp5bnwq35Xfy4H10K5vEfg11xbuTF2SgmS7mjmqmXKpEX4p7TEN5tfu1uegKyRr-BsMkGWUkhQYvrgExreo6XDZPO0CAQRcHfrDlfJR3MEpvwIraJCrLTegPvJQiqj3o33iTEVgpcx-SAOPdMymE6eHprIROfzp4HeQ2HzhsP6HDVhWPmDYQmlBltJ69P2EPjXsghXQ13dWCeKIzOWkQM_pts4ZHP5xfLU";
    const FIELDS_ROUTES = "id,created_at,name";

    const CONFIG_CALL = {
        method: 'GET',
        headers:{
            authorization: `${TOKEN}`,
            'Content-type': 'application/json; charset=UTF-8',
        }
    }

    let date = new Date();
    date.setDate(date.getDate()-2);

    const SELECT_ROUTE = document.getElementById("listRoutes");

    function getRoutes(dia, mes, ano){
        const QUERY_STRING = `fields=${FIELDS_ROUTES}&filter[0][field]=created_at&filter[0][operator]=gt&filter[0][value]=${ano}-${mes}-${dia} 00:00:00`;
        console.log(QUERY_STRING);
        return fetch(`${BASE_URI}routes?${QUERY_STRING}`, CONFIG_CALL);
    }

    function createOptions(routeId, createDate, name){
        let option = document.createElement('option');
        option.value=routeId;
        option.innerText = name +" - "+ createDate;

        return option;
   }

    async function populateSelect(dia, mes, ano){
        try {
            // Realizo a chamada para a função com o fetch configurado para retornar as tarefas do usuário
            let response = await getRoutes(dia, mes, ano);
            // Realizo a conversão dos dados recebidos
            let statusData = await response.status
            let data = await response.json();

            if (statusData == 200) {
                // Através do MAP realizo a varredura do array de objetos retornado, passando elemento a elemento
               
                console.log(data);
                
                data.data.map(dado => {
                    // capturo os dados do status da tarefa, descrição e id da tarefa retornado pela API
                    const routeId = dado.id;
                    const routeTitle = dado.created_at;
                    const routeCreateDate = dado.name;

                    // crio uma LI referente a tarefa
                    const optionItem = createOptions(routeId, routeTitle, routeCreateDate);

                    // defino em qual lista ela vai ser adicionada
                    SELECT_ROUTE.appendChild(optionItem);
                })
            }
            else if(statusData == 401){
                console.log('Erro: Você não está autenticado');
            }
            else{
                console.log('Erro no Serviço: Houve um erro no servidor, experimente atualizar a página.');
            }

        } catch (err) {
            console.log(`Erro gravíssimo: ${err}`);
        }
    }

    populateSelect(date.getDate(), date.getMonth()+1, date.getFullYear());
})();
