
function fetchData(url, method, body, callback) {
    if(method === "GET"){
        if(body != undefined && body != null){
            let keys = Object.keys(body);
            if(keys.length > 0){
                url = url + "?";
                let dt = [];
                for(var i=0;i<keys.length;i++){
                    dt.push(keys[i]+"="+body[keys[i]]);
                }
                url = url + dt.join("&");
            }
        }
        return fetch(url, {
            method: method,
            headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}
        }).then(response => response.json()).then(callback);
    }
    else if(method === "POST"){
        return fetch(url, {
            method: method,
            body: JSON.stringify(body),
            headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}
        }).then(response => response.json()).then(callback);
    }
}

class FetchApi {

    constructor(props){
        // this.baseurl = "http://10.165.7.169:3001";
        this.baseurl = "http://localhost:3001";
    }

    serachEmployeeDetails(data, callback){
        fetchData(this.baseurl + "/invoice/getinvoices", "GET", data, callback);
    }

    addNewBill(data, callback){
        fetchData(this.baseurl + "/invoice/add", "POST", data, callback);
    }

}

export default FetchApi;
