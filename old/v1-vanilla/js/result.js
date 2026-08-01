(()=>{
    const BASE_URI = 'https://api.vuupt.com/api/v1/';
    const TOKEN ="Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5MzcxZDcyYi0xZTVjLTQ2OGYtOTRmNi02YjM0Yzk2NDg3N2MiLCJqdGkiOiI0YzY0NzY5Yjc3ZTg2MDViNjA1YTQwOTIzYTdhNDkyMDIyMzE4Y2E2Y2MyOWI5ZWNmNjBlYzFmZmJmNTlkZGM3OWQ5NGJlOGMxMTNjMmFkYyIsImlhdCI6MTcwMDYwMTI1OS40MjkxNjMsIm5iZiI6MTcwMDYwMTI1OS40MjkxNjYsImV4cCI6NDg1NjI3NDg1OS40MTg2MDIsInN1YiI6IjI4MzQ0Iiwic2NvcGVzIjpbXX0.u75NIBdX9vw2O7HRA_c1CJKub61cg51Wm0thRJILyIoof-2MnF7nvN6HBMjH_14KJbsn4rb1l2cg1Rlqzrm99nRhI5WnG0CwmBww5K4XWM236pTq-gcqQz9IWC2PVcoLzzV9h8OJ8pTPaA3Dp3hnc99oMmkocL61BsI4Ba45OkH-C9VLu03gY98J8bGm7jwPV2Sqm0alKGM0aOEEb_2yAv4mVAAKEw4K9zEUZxqabZwmB7sdwdrfC1BpIr10-4QqQOJu8jvhcP9heOqP6Te9UacDGZ3gaUsj-yrVIXcXF_BCm5Mqewy3KMHc7_TeF16fBhFi6zs15-Q6HdgExC68wNKDPttQ5dsxmBzvPQwNU21zJWHP-Ut4JrmCeFnP_IzOYzz9sdGHd7mlXf4bNrNzOPygqSy2N61VcW2d8RyyL_kRYYDqDmoEyfJJgBh8X5633pc9zctuQQp5bnwq35Xfy4H10K5vEfg11xbuTF2SgmS7mjmqmXKpEX4p7TEN5tfu1uegKyRr-BsMkGWUkhQYvrgExreo6XDZPO0CAQRcHfrDlfJR3MEpvwIraJCrLTegPvJQiqj3o33iTEVgpcx-SAOPdMymE6eHprIROfzp4HeQ2HzhsP6HDVhWPmDYQmlBltJ69P2EPjXsghXQ13dWCeKIzOWkQM_pts4ZHP5xfLU";
    const FIELDS_ADDRESS = "id,route_id,customer_id,title,address,address_complement,phone_number,code"
    const MAIN_DIV = document.getElementById('listCard');
    const PRINT_BUTTON = document.getElementById('printButton');

    const CONFIG_CALL = {
        method: 'GET',
        headers:{
            authorization: `${TOKEN}`,
            'Content-type': 'application/json; charset=UTF-8',
        }
    }

    const queryString = new URLSearchParams(window.location.search);

   function getServices(idRoute){
        const QUERY_STRING = `fields=${FIELDS_ADDRESS}&filter[0][field]=route_id&filter[0][operator]=eq&filter[0][value]=${idRoute}`;

        return fetch(`${BASE_URI}services?${QUERY_STRING}`, CONFIG_CALL);
   }

   async function getCustomerName(customerId){
        let response = await fetch(`${BASE_URI}customers/${customerId}`, CONFIG_CALL);
        let statusData = await response.status
        let data = await response.json();

        if (statusData == 200) {
            document.getElementById(customerId).innerText = data.customer.name;
        }
    }

   function createCards(service, customer_id, phone,address){
        let card = document.createElement('div');
        card.classList.add("card");

        let serviceTitle = document.createElement('h1');
        serviceTitle.innerText = service;

        let customerName = document.createElement('h2');
        customerName.id = customer_id;

        let divToGroup = document.createElement('div');
        divToGroup.style="display: flex"

        let checkboxPaymentState = document.createElement('span');
        checkboxPaymentState.classList.add('checkbox');

        let checkboxPaymentStateText = document.createElement('p');
        checkboxPaymentStateText.innerText="Pago";

        let divToGroup2 = document.createElement('div');
        divToGroup2.style="display: flex"

        let checkboxPaymentState2 = document.createElement('span');
        checkboxPaymentState2.classList.add('checkbox');

        let checkboxPaymentStateText2 = document.createElement('p');
        checkboxPaymentStateText2.innerText="A Pagar R$_____________";

        divToGroup.appendChild(checkboxPaymentState);
        divToGroup.appendChild(checkboxPaymentStateText);

        divToGroup2.appendChild(checkboxPaymentState2);
        divToGroup2.appendChild(checkboxPaymentStateText2);

        let customerPhone = document.createElement('p');
        customerPhone.innerText = phone;

        let customerAddress = document.createElement('p');
        customerAddress.innerText = address;

        card.appendChild(serviceTitle);
        card.appendChild(customerName);
        card.appendChild(divToGroup);
        card.appendChild(divToGroup2);
        card.appendChild(customerPhone);
        card.appendChild(customerAddress);

        return card;
   }

    async function returnData(routeId) {
        try {
            // Realizo a chamada para a função com o fetch configurado para retornar as tarefas do usuário
            let response = await getServices(routeId);
            // Realizo a conversão dos dados recebidos
            let statusData = await response.status
            let data = await response.json();

            if (statusData == 200) {
                // Através do MAP realizo a varredura do array de objetos retornado, passando elemento a elemento
               
                // showUserData()
                
                data.data.map(dado => {
                    // capturo os dados do status da tarefa, descrição e id da tarefa retornado pela API
					console.log(dado)
                    const serviceTitle = dado.title == "Entrega de Produtos" ? dado.code : dado.title;
                    const customerId = dado.customer_id;
                    const customerPhone = dado.phone_number;
                    const customerAddress = dado.address+" "+dado.address_complement;

                    // crio uma LI referente a tarefa
                    const serviceCard = createCards(serviceTitle, customerId, customerPhone, customerAddress);

                    // defino em qual lista ela vai ser adicionada
                    MAIN_DIV.appendChild(serviceCard);
                    getCustomerName(customerId);
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

    returnData(queryString.get('routeId'));

    PRINT_BUTTON.addEventListener('click', function() {
        window.print();
    });

})();