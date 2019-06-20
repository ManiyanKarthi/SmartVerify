
function fetchData(props) {
    if(props.method === "GET"){
        let url = props.url;
        if(props.body){
            let keys = Object.keys(props.body);
            if(keys.length > 0){
                url = url + "?";
                let dt = [];
                for(var i=0;i<keys.length;i++){
                    dt.push(keys[i]+"="+props.body[keys[i]]);
                }
                url = url + dt.join("&");
            }
        }
        props.url = url;
    }

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.response) {
            console.log();
            let json = JSON.parse(xhr.response);
            props.success(json);
        }
        else {
            if(props.error){
                props.error();
            }
        }
    };
    xhr.open(props.method, props.url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=utf-8");
    xhr.timeout = props.timeout ? props.timeout : 30000;
    xhr.ontimeout = function () {
        props.onTimeout();
    }
    xhr.send(JSON.stringify(props.body));
}

class FetchApi {

    constructor(props){
        // this.baseurl = "http://10.165.7.169:3001";
        this.baseurl = "http://localhost:3001";
    }

    serachEmployeeDetails(props){
        props.url = this.baseurl + "/invoice/getinvoices";
        props.method = "GET";
        fetchData(props);
    }

    addNewBill(props){
        props.url = this.baseurl + "/invoice/add";
        props.method = "POST";
        fetchData(props);
    }

    smartVerifyBill(props){
        props.url = this.baseurl + "/invoice/smart-verify";
        props.method = "POST";
        fetchData(props);
    }

    getEmployeeForVerification(data, callback){
        fetchData(this.baseurl + "/invoice/getinvoices", "GET", data, callback);
    }

}

export default FetchApi;
